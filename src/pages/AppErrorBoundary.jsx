import { Component } from 'react'

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Screen rendering failed', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#fff8e8', textAlign: 'center' }}>
        <section>
          <div style={{ fontSize: 70 }}>🔧</div>
          <h1 style={{ marginBottom: 12, color: '#69472e' }}>がめんを もどすね</h1>
          <p style={{ marginBottom: 20, color: '#876143' }}>もういちど ちずから あそんでね</p>
          <button className="btn btn-primary" onClick={() => { window.location.href = '/kids' }}>ちずへ もどる</button>
        </section>
      </main>
    )
  }
}
