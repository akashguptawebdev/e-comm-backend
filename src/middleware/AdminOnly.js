const Adminonly = async (req, res, next) => {
  try {
    if (req?.user?.role != "admin") {
      return res.status(403).json("You are not authorized to access this resource");
    }
    next();
  } catch (error) {
    console.error("Error in Adminonly middleware:", error);
    return res.status(500).json("Enteral error" , error);
  }
};

export default Adminonly;
