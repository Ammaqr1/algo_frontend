import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import './auth.css'

export function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Sign in</h1>
        <p className="auth-lead">Welcome back. Enter your credentials to continue.</p>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="signin-email">Email</label>
            <input
              id="signin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="signin-password">Password</label>
            <input
              id="signin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="auth-submit">
            Sign in
          </button>
        </form>

        {submitted ? (
          <p className="auth-demo-notice" role="status">
            Form submitted. Connect the API when your backend is ready—no data was
            sent.
          </p>
        ) : null}

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/sign-up">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
