const User = require('../models/User');
const UserUtil = require('../utils/user-util')

const searchController ={}

//Tìm khi cung cấp một trong 3 truiong72
//or chỉ cần 1 điều kiện đúng là trả về
//regex tìm kiếm chuôĩ có chứa mẫu cung cấp
//option i không phân biệt chữ hoa hay thường
searchController.getUserByEmailPhoneNumberEmail = async (req, res) => {
  try {
    console.log('body', req.body)
    const {searchTerm} = req.body
    const users = await User.find({
      $or: [
          { username: { $regex: searchTerm, $options: 'i' } },
          { phoneNumber: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
      ],
  });
    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'Lỗi khi tìm user theo email' });
  }
};

module.exports = searchController