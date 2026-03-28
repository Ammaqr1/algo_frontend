import { Link } from 'react-router-dom'
import './home.css'

export function HomePage() {
  return (
    <div className="home-page">
      <h1>Algo</h1>
      <p className="home-lead">Sign in or create an account to continue.</p>
      <div className="home-actions">
        <Link className="home-btn home-btn--primary" to="/sign-in">
          Sign in
        </Link>
        <Link className="home-btn" to="/sign-up">
          Sign up
        </Link>
      </div>
    </div>
  )
}
