import { useEffect, useRef, useState } from 'react'
import { createHeightField, REGION } from '../data/region.js'

function createBoundaryTexture(THREE) {
  const canvas = document.createElement('canvas')
  canvas.width = 1000
  canvas.height = 700
  const context = canvas.getContext('2d')
  if (!context || typeof Path2D === 'undefined') throw new Error('Canvas path masking is unavailable.')
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#ffffff'
  context.fill(new Path2D(REGION.boundaryPath))
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.NoColorSpace
  texture.needsUpdate = true
  return texture
}

export default function TerrainScene({ stateId, reducedMotion = false, resolution = 96, onUnavailable }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const unavailableRef = useRef(onUnavailable)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    unavailableRef.current = onUnavailable
  }, [onUnavailable])

  useEffect(() => {
    let disposed = false
    let frameId = 0
    let resizeObserver
    let intersectionObserver
    let onVisibilityChange

    const mount = mountRef.current
    if (!mount) return undefined

    const initialize = async () => {
      try {
        const THREE = await import('three')
        if (disposed || !mountRef.current) return

        const scene = new THREE.Scene()
        const camera = new THREE.OrthographicCamera(-5, 5, 3.5, -3.5, 0.1, 30)
        camera.position.set(0, 0, 10)
        camera.lookAt(0, 0, 0)

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
        renderer.setClearColor(0x000000, 0)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        mount.appendChild(renderer.domElement)

        const safeResolution = Math.max(48, Math.min(128, resolution))
        const geometry = new THREE.PlaneGeometry(10, 7, safeResolution - 1, safeResolution - 1)
        const boundaryTexture = createBoundaryTexture(THREE)
        const material = new THREE.MeshStandardMaterial({
          color: 0xd9c9a6,
          roughness: 0.94,
          metalness: 0,
          alphaMap: boundaryTexture,
          alphaTest: 0.5,
          transparent: true,
          side: THREE.DoubleSide,
        })
        const terrain = new THREE.Mesh(geometry, material)
        scene.add(terrain)

        const wireMaterial = new THREE.MeshBasicMaterial({
          color: 0x71806a,
          wireframe: true,
          transparent: true,
          opacity: 0.12,
          alphaMap: boundaryTexture,
          alphaTest: 0.5,
        })
        const wire = new THREE.Mesh(geometry, wireMaterial)
        wire.position.z = 0.014
        scene.add(wire)

        const ambient = new THREE.HemisphereLight(0xfcfcfb, 0x71806a, 1.7)
        const daylight = new THREE.DirectionalLight(0xfcfcfb, 3.8)
        daylight.position.set(-4, 3, 9)
        scene.add(ambient, daylight)

        const sourceField = createHeightField(stateId, safeResolution).values
        const position = geometry.attributes.position
        for (let index = 0; index < position.count; index += 1) {
          position.setZ(index, sourceField[index] * 0.82)
        }
        position.needsUpdate = true
        geometry.computeVertexNormals()

        let visible = true
        let currentState = stateId
        let currentValues = sourceField.slice()

        const render = () => {
          if (!disposed && visible && document.visibilityState === 'visible') renderer.render(scene, camera)
        }

        const resize = () => {
          if (!mountRef.current || disposed) return
          const width = Math.max(1, mountRef.current.clientWidth)
          const height = Math.max(1, mountRef.current.clientHeight)
          const maxPixels = 1800000
          const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(maxPixels / (width * height)))
          renderer.setPixelRatio(Math.max(1, pixelRatio))
          renderer.setSize(width, height, false)
          render()
        }

        const applyState = (nextState, immediate) => {
          if (nextState === currentState && sceneRef.current) return
          currentState = nextState
          const targetValues = createHeightField(nextState, safeResolution).values
          const fromValues = currentValues.slice()
          const duration = immediate ? 0 : 720
          const started = performance.now()

          cancelAnimationFrame(frameId)
          const update = (time) => {
            if (disposed) return
            const raw = duration === 0 ? 1 : Math.min(1, (time - started) / duration)
            const eased = 1 - Math.pow(1 - raw, 4)
            for (let index = 0; index < position.count; index += 1) {
              position.setZ(index, (fromValues[index] + (targetValues[index] - fromValues[index]) * eased) * 0.82)
            }
            position.needsUpdate = true
            geometry.computeVertexNormals()
            render()
            if (raw < 1 && visible && document.visibilityState === 'visible') frameId = requestAnimationFrame(update)
            else currentValues = targetValues.slice()
          }
          frameId = requestAnimationFrame(update)
        }

        resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(mountRef.current)
        intersectionObserver = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting
          if (visible) render()
          else cancelAnimationFrame(frameId)
        }, { rootMargin: '120px' })
        intersectionObserver.observe(mountRef.current)

        onVisibilityChange = () => {
          if (document.visibilityState === 'hidden') cancelAnimationFrame(frameId)
          else render()
        }
        document.addEventListener('visibilitychange', onVisibilityChange)

        sceneRef.current = { applyState, renderer, geometry, material, wireMaterial, boundaryTexture }
        resize()
        setStatus('ready')
      } catch (error) {
        console.error('Terrain enhancement could not load.', error)
        if (!disposed) {
          setStatus('fallback')
          unavailableRef.current?.()
        }
      }
    }

    const idleId = 'requestIdleCallback' in window
      ? window.requestIdleCallback(initialize, { timeout: 1000 })
      : window.setTimeout(initialize, 120)

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleId)
      else window.clearTimeout(idleId)
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      if (onVisibilityChange) document.removeEventListener('visibilitychange', onVisibilityChange)
      const resources = sceneRef.current
      if (resources) {
        resources.geometry.dispose()
        resources.material.dispose()
        resources.wireMaterial.dispose()
        resources.boundaryTexture.dispose()
        resources.renderer.dispose()
        resources.renderer.forceContextLoss()
        resources.renderer.domElement.remove()
      }
      sceneRef.current = null
    }
  }, [resolution])

  useEffect(() => {
    sceneRef.current?.applyState(stateId, reducedMotion)
  }, [stateId, reducedMotion])

  return (
    <div className="terrain-scene" ref={mountRef} aria-hidden="true">
      {status === 'loading' ? <span className="terrain-status">Preparing registered relief</span> : null}
      {status === 'fallback' ? <span className="terrain-status">Relief unavailable</span> : null}
    </div>
  )
}
