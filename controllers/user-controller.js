import User from '../models/User.js';
import LinksBio from '../models/LinksBio.js';
import generateJWT from '../helpers/generate-jwt.js';
import generateID from '../helpers/generate-id.js';

const registerUser = async (req, res) => {
	const { email, nickName } = req.body;
	const userExiting = await User.findOne({ email: email });

	if (userExiting) {
		const error = new Error('El usuario ya existe.');
		return res.status(400).json({ msg: error.message });
	}

	try {
		const user = new User(req.body);

		const linkBio = new LinksBio({
			name: nickName,
			title: nickName,
			description: '',
			imageProfile: '',
			bannerImage: '',
			links: [],
			user: user._id,
		});

		user.token = generateID();
		user.confirm = true;

		await linkBio.save();
		await user.save();

		// Send Email confirm
		// emailRegister({
		// 	email: user.email,
		// 	name: user.name,
		// 	token: user.token,
		// });
		res.json({
			user: { email: user.email },
			msg: 'Usuario creado correctamente, revisa tu email para confirmar',
		});
	} catch (error) {
		console.log(error);
	}
};

const authenticateUser = async (req, res) => {
	const { email, password } = req.body;

	// Comprobar si el usuario existe
	const user = await User.findOne({ email: email });

	if (!user) {
		const error = new Error('User not existent');
		res.status(404).json({ msg: error.message });
	}

	// Comprobar si el usuario esta confirmado

	// if (!user.confirm) {
	// 	const error = new Error('Your account has not been confirmed');
	// 	res.status(403).json({ msg: error.message });
	// }

	// Comprobar su password

	if (await user?.checkPassword(password)) {
		// res.set('token', 'asdasdasasdzxc12323');
		// res.set('Access-Control-Expose-Headers', 'token');

		res.json({
			_id: user?._id,
			name: user?.firstName,
			lastname: user?.lastName,
			nickname: user?.nickName,
			email: user?.email,
			token: generateJWT(user?._id),
		});
	} else {
		const error = new Error('El correo o contraseña son incorrectos');
		res.status(403).json({ msg: error.message });
	}
};

const profileUser = (req, res) => {
	res.json(req.user);
};

const createNicknameUser = (req, res) => {
	console.log(req.body);

	// const linksBio = new LinksBio({
	// 	name: '',
	// 	description: '',
	// 	imageProfile: '',
	// 	bannerImage: '',
	// 	links: [],
	// 	user: user._id,
	// });
	// await linksBio.save();
};

const profileLink = async (req, res) => {
	const { nickname } = req.params;
	const dataLinkBio = await LinksBio.findOne({ name: nickname });

	if (!dataLinkBio) {
		const error = new Error('Este usuario no existe');
		return res.status(404).json({ msg: error.message });
	}

	res.json(dataLinkBio);
};

export { registerUser, authenticateUser, profileUser, createNicknameUser, profileLink };
