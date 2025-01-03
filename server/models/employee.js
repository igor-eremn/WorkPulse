import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: Number, required: true },
    password: { type: String, required: true },
}, {
    timestamps: true,
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;