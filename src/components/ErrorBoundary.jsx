import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { err: null }
  }
  static getDerivedStateFromError(err) {
    return { err }
  }
  componentDidCatch(err, info) {
    console.error('[ErrorBoundary]', err, info)
  }
  render() {
    if (this.state.err) {
      return (
        <div className="error-boundary">
          <h2>🥀 Something broke</h2>
          <p>{this.state.err?.message || 'Unknown error.'}</p>
          <button className="btn btn-signup" onClick={() => this.setState({ err: null })}>Try again</button>
          <button className="btn btn-login" style={{marginLeft:'0.5rem'}} onClick={() => location.reload()}>Reload</button>
        </div>
      )
    }
    return this.props.children
  }
}
