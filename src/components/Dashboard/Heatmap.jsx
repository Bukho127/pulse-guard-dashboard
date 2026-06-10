import { useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

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

function HeatmapMap({
  routeCoordinates = DEMO_ROUTE_COORDINATES,
  routeAnimationDuration = 1900,
  showRoute = true,
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
      setMapError(error.message || 'Mapbox could not start.')
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

      if (!hasRoute) {
        return
      }

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
        source.setData(createRouteFeature(buildAnimatedRouteCoordinates(routeCoordinates, progress)))
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
    </div>
  )
}

function Heatmap() {
  return (
    <div className='px-4'>
      <div className='mb-4'>
        <h2 className='text-lg font-semibold text-stone-950'>Heatmap</h2>
        <p className='text-sm text-stone-500'>
          Route view prepared for incident mapping. Heatmap painting is intentionally disabled.
        </p>
      </div>
      <HeatmapMap />
    </div>
  )
}

export default Heatmap
