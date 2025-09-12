import { getAcsTokenForTeams, getAcsTokenForGuestUser } from '../utils/loginUtil'


const loginUser = async () => {
    await getAcsTokenForTeams();
}

const LoginButton = () => {
    return (
        <button
            onClick={loginUser}
            className="bg-white text-blue-900 font-semibold px-5 py-2 rounded shadow hover:bg-blue-100 transition border border-blue-900">
            Login
        </button>
    );
}

export default LoginButton;