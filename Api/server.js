import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";

// CONFIGURACIÓN
const app = express();
app.use(cors());
app.use(express.json());

// 🔗 Conexión a MongoDB
const MONGO_URI = "mongodb+srv://Jaeger666_:paul1234@cluster0.qo6laex.mongodb.net/miapp"; 
const JWT_SECRET = "supersecreto123";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.log(err));


// 📌 MODELO DE USUARIO
const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  membresia: { type: String, default: "Usuario" }
});

const User = mongoose.model("User", userSchema);


// 📌 REGISTRO
app.post("/api/register", async (req, res) => {
  try {
    const { nombre, correo, password, membresia } = req.body;

    const existe = await User.findOne({ correo });
    if (existe) return res.status(400).json({ msg: "El correo ya existe" });

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      nombre,
      correo,
      password: hashed,
      membresia,
    });

    res.json({ msg: "Registro exitoso" });
  } catch (err) {
    res.status(500).json({ msg: "Error", err });
  }
});


// 📌 LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    const usuario = await User.findOne({ correo });
    if (!usuario) return res.status(400).json({ msg: "Datos incorrectos" });

    const validar = await bcrypt.compare(password, usuario.password);
    if (!validar) return res.status(400).json({ msg: "Datos incorrectos" });

    const token = jwt.sign(
      { id: usuario._id, membresia: usuario.membresia },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login correcto",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        membresia: usuario.membresia,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Error", err });
  }
});


// 📌 SERVIDOR
app.listen(3000, () => console.log("Servidor en puerto 3000"));

