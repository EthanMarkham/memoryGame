export function Nav({ state, dispatch, actions }) {
  const LogoutBtn = () => <div className="col navItem"><button className="logoutBtn btn" onClick={() => dispatch({ type: "LOGOUT" })}>Logout</button></div>
  const GamesBtn = () => <div className="col navItem"><button className="logoutBtn btn" onClick={() => dispatch({ type: "NEXT_PAGE", payload: {page: 1}  })}>Games</button></div>
  const UsersBtn = () => <div className="col navItem"><button className="logoutBtn btn" onClick={() => dispatch({ type: "NEXT_PAGE", payload: {page: 3} })}>Users</button></div>
  return (
    <nav>
      <h1> AOE2 MEMORY ADMIN</h1>
      <div className="row navItems">
        <UsersBtn />
        <GamesBtn />
        <LogoutBtn />
      </div>
    </nav>
  )
}
