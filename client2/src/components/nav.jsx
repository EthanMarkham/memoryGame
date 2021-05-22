import { DistortionText } from "react-text-fun";

const Distortion = ({ text }) => {
  return (
    <>
      <DistortionText
        text={text}
        fontSize={100}
        speed={0.5}
        rotation={0}
        distortX={0.3}
        distortY={0.3}
        noiseAmplitude={0.1}
        noiseVolatility={0.3}
        fontFamily={"trajan-pro-3"}
        //generic
        fill={"#5d7a8b"}
        appendTo={'navBar'}
        paddingTop={10}
        paddingBottom={10}
        paddingLeft={30}
        paddingRight={30}
      />
    </>
  );
};

function Nav(props) {
  const { auth, logout } = props
  const logOut = <div className="item"><div className="logoutBtn" onClick={logout}>Logout</div>
  </div>
  return (
    <nav id='navBar'>
      <Distortion text="AOEII MEMORY" />
      <div className="navItems">
        {auth.isAuth ? logOut : ' '}
      </div>
    </nav>
  )
}

export default Nav