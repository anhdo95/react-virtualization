import { Link } from 'react-router-dom'

function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <nav className="navbar">
        <Link className="navbar-link" to="/list">List</Link>
        <Link className="navbar-link" to="/grid">Grid</Link>
      </nav>
      <main className="main">{children}</main>
    </>
  )
}

export default Layout
