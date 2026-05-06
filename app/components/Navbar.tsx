import {Link} from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-lg font-bold text-gradient">Cake®Stack</p>
            </Link>
            <Link to="/upload" className="primary-button w-fit">
                Upload CV
            </Link>
        </nav>
    )
}
export default Navbar
