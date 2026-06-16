/* HeatmapMap Component. this still needs work */

import { useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { fetchHeatmapPoints, fetchHeatmapByMonth } from '../../api'

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const DEFAULT_CENTER = [18.4241, -33.9249]
const DEMO_ROUTE_COORDINATES = [
  [18.4241, -33.9249],
  [18.4386, -33.9322],
  [18.4611, -33.9429],
  [18.5055, -33.9731],
  [18.5488, -34.0006],
]

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

function createRouteFeature(coordinates) {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates,
    },
  }
}

function createRoutePointFeature(coordinate, pointType) {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { pointType },
        geometry: {
          type: 'Point',
          coordinates: coordinate,
        },
      },
    ],
  }
}

function buildAnimatedRouteCoordinates(coordinates, progress) {
  const targetLength = Math.max(1, Math.ceil(coordinates.length * progress))
  return coordinates.slice(0, targetLength)
}

function fitRouteBounds(map, coordinates) {
  const bounds = coordinates.reduce(
    (nextBounds, coordinate) => nextBounds.extend(coordinate),
    new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
  )

  map.fitBounds(bounds, {
    padding: 72,
    duration: 900,
    maxZoom: 13,
  })
}

// Convert H3 heatmap data to GeoJSON format for Mapbox
function convertHeatmapToGeoJSON(heatmapFeatures) {
  return {
    type: 'FeatureCollection',
    features: heatmapFeatures.map((feature) => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            ...feature.boundary.map((b) => [b.lng, b.lat]),
            [feature.boundary[0].lng, feature.boundary[0].lat], // Close polygon
          ],
        ],
      },
      properties: {
        h3Index: feature.h3Index,
        count: feature.count,
        color: feature.color,
        intensity: feature.intensity,
      },
    })),
  }
}

function HeatmapMap({
  heatmapData = null,
  routeCoordinates = DEMO_ROUTE_COORDINATES,
  routeAnimationDuration = 1900,
  showRoute = true,
  showHeatmap = true,
  interactive = true,
  showLocationStatus = true,
  showUserLocation = true,
  zoomLevel = 12,
}) {
  const canUseGeolocation = 'geolocation' in navigator
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const frameRef = useRef(null)
  const [centerCoordinate, setCenterCoordinate] = useState(DEFAULT_CENTER)
  const [isLocating, setIsLocating] = useState(canUseGeolocation)
  const [locationStatus, setLocationStatus] = useState(
    canUseGeolocation ? null : 'Your browser does not support location access.'
  )
  const [mapError, setMapError] = useState(null)
  const [hoveredFeature, setHoveredFeature] = useState(null)

  const hasRoute = showRoute && routeCoordinates.length > 1
  const routeOriginShape = useMemo(
    () => createRoutePointFeature(routeCoordinates[0] ?? DEFAULT_CENTER, 'origin'),
    [routeCoordinates]
  )
  const routeDestinationShape = useMemo(
    () =>
      createRoutePointFeature(
        routeCoordinates[routeCoordinates.length - 1] ?? DEFAULT_CENTER,
        'destination'
      ),
    [routeCoordinates]
  )

  const heatmapGeoJSON = useMemo(() => {
    console.log('useMemo running')
    console.log('heatmapData:', heatmapData)
    console.log('typeof heatmapData:', typeof heatmapData)
    console.log('heatmapData?.features:', heatmapData?.features)
    console.log('Array.isArray(heatmapData?.features):', Array.isArray(heatmapData?.features))

    if (!heatmapData) {
      console.log('heatmapData is falsy')
      return null
    }

    if (!Array.isArray(heatmapData.features)) {
      console.log('features is not array, type:', typeof heatmapData.features)
      return null
    }

    console.log(' Converting', heatmapData.features.length, 'features')
    const geojson = convertHeatmapToGeoJSON(heatmapData.features)
    console.log(' GeoJSON created:', geojson)
    return geojson
  }, [heatmapData])

  // Geolocation
  useEffect(() => {
    if (!canUseGeolocation) {
      return undefined
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCenter = [position.coords.longitude, position.coords.latitude]
        setCenterCoordinate(nextCenter)
        mapRef.current?.flyTo({ center: nextCenter, zoom: zoomLevel, essential: true })
        setLocationStatus(null)
        setIsLocating(false)
      },
      (error) => {
        setLocationStatus(error.message || 'Allow location access to center the map.')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [canUseGeolocation, zoomLevel])

  // Initialize map
  useEffect(() => {
    if (!MAPBOX_ACCESS_TOKEN || !mapContainerRef.current || mapRef.current) {
      return
    }

    let map

    try {
      map = new mapboxgl.Map({
        accessToken: MAPBOX_ACCESS_TOKEN,
        container: mapContainerRef.current,
        center: centerCoordinate,
        zoom: zoomLevel,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        attributionControl: false,
        interactive,
      })
    } catch (error) {
      queueMicrotask(() => setMapError(error.message || 'Mapbox could not start.'))
      return
    }

    mapRef.current = map
    setMapError(null)
    requestAnimationFrame(() => map.resize())

    if (interactive) {
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')
      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right')
    }

    if (showUserLocation) {
      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        'top-right'
      )
    }

    map.on('error', (event) => {
      const message =
        event?.error?.message ||
        event?.error?.statusText ||
        'Mapbox could not load the map style.'
      setMapError(message)
    })

    map.on('load', () => {
      map.resize()

      // Add route layer if needed
      if (hasRoute) {
        map.addSource('animated-route-source', {
          type: 'geojson',
          data: createRouteFeature([routeCoordinates[0]]),
        })
        map.addSource('route-origin-source', {
          type: 'geojson',
          data: routeOriginShape,
        })
        map.addSource('route-destination-source', {
          type: 'geojson',
          data: routeDestinationShape,
        })

        map.addLayer({
          id: 'animated-route-glow',
          type: 'line',
          source: 'animated-route-source',
          paint: {
            'line-color': 'rgba(87, 190, 71, 0.24)',
            'line-width': 12,
          },
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
        })

        map.addLayer({
          id: 'animated-route-line',
          type: 'line',
          source: 'animated-route-source',
          paint: {
            'line-color': '#57BE47',
            'line-width': 5,
          },
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
        })

        map.addLayer({
          id: 'route-origin-dot',
          type: 'circle',
          source: 'route-origin-source',
          paint: {
            'circle-color': '#FFFFFF',
            'circle-radius': 6,
            'circle-stroke-color': '#202020',
            'circle-stroke-width': 3,
          },
        })

        map.addLayer({
          id: 'route-destination-dot',
          type: 'circle',
          source: 'route-destination-source',
          paint: {
            'circle-color': '#57BE47',
            'circle-radius': 7,
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-width': 3,
          },
        })

        fitRouteBounds(map, routeCoordinates)
      }
    })

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      map.remove()
      mapRef.current = null
    }
  }, [
    centerCoordinate,
    hasRoute,
    interactive,
    routeCoordinates,
    routeDestinationShape,
    routeOriginShape,
    showUserLocation,
    zoomLevel,
  ])

  // Add heatmap layers when GeoJSON is ready (SEPARATE useEffect)
  useEffect(() => {
    if (!mapRef.current || !showHeatmap || !heatmapGeoJSON) {
      console.log('Waiting for: map=', !!mapRef.current, 'showHeatmap=', showHeatmap, 'geojson=', !!heatmapGeoJSON)
      return
    }

    const map = mapRef.current

    // Wait for map to be loaded
    if (!map.isStyleLoaded()) {
      console.log('Map not yet loaded, waiting...')
      map.once('load', () => addHeatmapLayers(map))
      return
    }

    addHeatmapLayers(map)

    function addHeatmapLayers(mapInstance) {
      // Check if source already exists
      if (mapInstance.getSource('h3-heatmap-source')) {
        console.log('Updating heatmap data')
        mapInstance.getSource('h3-heatmap-source').setData(heatmapGeoJSON)
        return
      }

      console.log('Adding heatmap source and layers')

      mapInstance.addSource('h3-heatmap-source', {
        type: 'geojson',
        data: heatmapGeoJSON,
      })

      mapInstance.addLayer({
        id: 'h3-heatmap-fill',
        type: 'fill',
        source: 'h3-heatmap-source',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': ['get', 'intensity'],
        },
      })

      mapInstance.addLayer({
        id: 'h3-heatmap-outline',
        type: 'line',
        source: 'h3-heatmap-source',
        paint: {
          'line-color': '#fff',
          'line-width': 0.5,
          'line-opacity': 0.5,
        },
      })

      // Hover effects
      mapInstance.on('mousemove', 'h3-heatmap-fill', (e) => {
        if (e.features.length > 0) {
          mapInstance.getCanvas().style.cursor = 'pointer'
          setHoveredFeature(e.features[0])
        }
      })

      mapInstance.on('mouseleave', 'h3-heatmap-fill', () => {
        mapInstance.getCanvas().style.cursor = ''
        setHoveredFeature(null)
      })

      // Click to show incident count
      mapInstance.on('click', 'h3-heatmap-fill', (e) => {
        if (e.features.length > 0) {
          const feature = e.features[0]
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(
              `<div class="p-2">
                <p class="font-semibold text-sm">${feature.properties.count} incident(s)</p>
                <p class="text-xs text-gray-500">H3 Index: ${feature.properties.h3Index}</p>
              </div>`
            )
            .addTo(mapInstance)
        }
      })

      console.log('Heatmap layers added successfully')

      // DEBUG: Check if layer exists
      try {
        const layers = mapInstance.getStyle().layers
        const heatmapLayer = layers.find(l => l.id === 'h3-heatmap-fill')
        console.log('Heatmap layer exists?', !!heatmapLayer)
        if (heatmapLayer) {
          console.log('Layer paint:', heatmapLayer.paint)
        }
      } catch (err) {
        console.error('Error checking layer:', err)
      }

      // AUTO-FIT TO SHOW HEXAGON
      if (heatmapGeoJSON && heatmapGeoJSON.features.length > 0) {
        console.log('Fitting bounds to hexagon')
        const bounds = heatmapGeoJSON.features.reduce((bounds, feature) => {
          feature.geometry.coordinates[0].forEach(([lng, lat]) => {
            bounds.extend([lng, lat])
          })
          return bounds
        }, new mapboxgl.LngLatBounds())

        mapInstance.fitBounds(bounds, { padding: 50, duration: 1000 })
        console.log('Fitted bounds, map center:', mapInstance.getCenter())
      }
    }
  }, [showHeatmap, heatmapGeoJSON])

  // Route animation
  useEffect(() => {
    if (!hasRoute) {
      return undefined
    }

    const startedAt = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startedAt
      const progress = Math.min(elapsed / routeAnimationDuration, 1)
      const source = mapRef.current?.getSource('animated-route-source')

      if (source && 'setData' in source) {
        source.setData(
          createRouteFeature(buildAnimatedRouteCoordinates(routeCoordinates, progress))
        )
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [hasRoute, routeAnimationDuration, routeCoordinates])

  if (!MAPBOX_ACCESS_TOKEN) {
    return (
      <div className='flex min-h-[520px] flex-col items-center justify-center rounded border border-stone-300 bg-white px-7 text-center'>
        <h3 className='text-lg font-semibold text-stone-950'>Mapbox token missing</h3>
        <p className='mt-2 max-w-md text-sm leading-6 text-stone-500'>
          Add VITE_MAPBOX_ACCESS_TOKEN to your dashboard environment to render the route map.
        </p>
      </div>
    )
  }

  return (
    <div className='relative h-[520px] overflow-hidden rounded border border-stone-300 bg-white'>
      <div ref={mapContainerRef} className='h-full w-full' />

      {mapError ? (
        <div className='absolute left-4 right-4 top-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-sm'>
          {mapError}
        </div>
      ) : null}

      {showLocationStatus && !mapError && (isLocating || locationStatus) ? (
        <div className='absolute left-4 right-4 top-4 flex min-h-10 items-center gap-2 rounded bg-white/95 px-3 text-sm text-stone-900 shadow-sm'>
          {isLocating ? (
            <span className='h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-stone-200 border-t-[#57BE47]' />
          ) : null}
          <span className='min-w-0 flex-1'>
            {isLocating ? 'Finding your location...' : locationStatus}
          </span>
        </div>
      ) : null}

      {hoveredFeature ? (
        <div className='absolute bottom-4 left-4 rounded bg-white/95 px-3 py-2 text-sm shadow-sm'>
          <p className='font-semibold text-stone-900'>{hoveredFeature.properties.count} incidents</p>
          <p className='text-xs text-stone-500'>Hover over hexagons for details</p>
        </div>
      ) : null}
    </div>
  )
}

function Heatmap({ token, month = null, showRoute = false }) {
  const [heatmapData, setHeatmapData] = useState(null)
  const [heatmapLoading, setHeatmapLoading] = useState(Boolean(token))
  const [heatmapError, setHeatmapError] = useState(null)

  useEffect(() => {
    if (!token) {
      return
    }

    let active = true
    setHeatmapLoading(true)

    // Choose the correct API call based on whether month is provided
    const apiCall = month ? fetchHeatmapByMonth(token, month) : fetchHeatmapPoints(token)

    apiCall
      .then((data) => {
        if (!active) {
          return
        }

        console.log('Heatmap data received:', data)
        setHeatmapData(data)
        console.log('📍 State set to:', data)
        setHeatmapError(null)
      })
      .catch((err) => {
        if (!active) {
          return
        }
        console.log('Heatmap data received:', data)
        console.log('Data type:', data.type)
        console.log('Data features:', data.features)
        console.log('Is array?', Array.isArray(data.features))

        console.error('Heatmap error:', err.message)
        setHeatmapError(err?.message || 'Unable to load heatmap data.')
      })
      .finally(() => {
        if (active) {
          setHeatmapLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [token, month])

  return (
    <div className='px-4'>
      <div className='mb-4'>
        <h2 className='text-lg font-semibold text-stone-950'>Heatmap</h2>
        <p className='text-sm text-stone-500'>
          Incident heatmap with H3 hexagonal grid visualization. Colors represent incident density:
          Green (low) → Yellow → Orange → Red (high).
        </p>
        <div className='mt-3 flex flex-wrap gap-3 text-sm text-stone-600'>
          {heatmapLoading ? (
            <span className='rounded bg-blue-50 px-3 py-2 text-blue-700'>
              Loading heatmap data…
            </span>
          ) : heatmapError ? (
            <span className='rounded bg-red-50 px-3 py-2 text-red-700'>{heatmapError}</span>
          ) : heatmapData ? (
            <span className='rounded bg-green-50 px-3 py-2 text-green-700'>
              {heatmapData.metadata?.totalIncidents || 0} incidents in{' '}
              {heatmapData.metadata?.totalHexagons || 0} hexagon grid cells
            </span>
          ) : null}
        </div>
      </div>
      <HeatmapMap heatmapData={heatmapData} showRoute={showRoute} showHeatmap={true} />
    </div>
  )
}

export default Heatmap
