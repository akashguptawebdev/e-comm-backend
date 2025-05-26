import jwt from 'jsonwebtoken';
export function generateToken(user) {
  // Generate JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  return token;
}