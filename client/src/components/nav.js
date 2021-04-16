function Nav(props) {
  const { auth, dispatch } = props
  
  const Logout = () => {
    dispatch({type: "LOGOUT"})
  }

  const logOut = <div className="btn item"><div className="logoutBtn btn" onClick={Logout}>Logout</div>
  </div>
  return (
    <nav>
      <h1> AOE2 MEMORY </h1>
      <div className="navItems">
        {auth.isAuth ? logOut : ' '}
      </div>
    </nav>
  )
}

export default Nav