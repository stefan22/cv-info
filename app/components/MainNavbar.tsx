import {Link} from "react-router";

const MainNavbar = () => {
    return (
        <nav className="flex w-full justify-around mb-20">
            <Link to="/">
                <p className="text-lg font-bold text-gradient">Cake®Stack</p>
            </Link>
            <Link to="/upload">
                <p className="text-lg font-bold text-gradient">Upload</p>
            </Link>
            <Link to="/auth">
                <p className="text-lg font-bold text-gradient">Sign In</p>
            </Link>
            <Link to="/auth">
                <p className="text-lg font-bold text-gradient">Sign Up</p>
            </Link>

        </nav>
    )
}
export default MainNavbar
