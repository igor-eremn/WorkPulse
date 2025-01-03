import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    employee_id: { type: String, required: true },
    clock_in_time: { type: Date, required: true },
    break_in_time: { type: Date, default: null },
    break_out_time: { type: Date, default: null },
    clock_out_time: { type: Date, default: null },
}, {
    timestamps: true,
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;