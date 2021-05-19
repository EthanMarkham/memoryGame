function Nav(props) {
  const { auth, logout } = props
  const logOut = <div className="item"><div className="logoutBtn" onClick={logout}>Logout</div>
  </div>
  return (
    <nav>
      <h1> AOEII MEMORY </h1>
      <div className="navItems">
        {auth.isAuth ? logOut : ' '}
      </div>
    </nav>
  )
}

export default Nav