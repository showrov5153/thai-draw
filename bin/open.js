export const Balance_Cut_Controller = async (req, res) => {
    try {
      const { bBalance } = req.body;
      const { id } = req.user;
  
      // Validate that bBalance is a positive number
      if (typeof bBalance !== "number" || bBalance < 0) {
        return res.status(400).json({
          message: "Invalid bBalance value. It must be a non-negative number.",
        });
      }
  
      // Find the user by ID
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      user.bBalance = bBalance;
  
      // Deduction amount based on step value
      const stepDeductionMap = {
        10: 4,
        20: 8,
        30: 12,
        40: 16,
        50: 20,
        60: 24,
        70: 28,
        80: 32,
        90: 36,
        100: 40,
        110: 44,
        120: 48,
        130: 52,
        140: 56,
        150: 60,
        160: 64,
        170: 68,
        180: 72,
        190: 76,
        200: 80,
        210: 84,
        220: 88,
        230: 92,
        240: 96,
        250: 100,
      };
  
      // Check if step is valid for deduction
      const deduction = stepDeductionMap[user.step];
      if (deduction) {
        // Check if user has enough balance
        if (user.balance >= deduction) {
          user.balance -= deduction; // Deduct from balance
          await user.save(); // Save updated user
          return res.status(200).json({
            message: `Balance updated successfully. Deducted ${deduction}.`,
            balance: user.balance,
          });
        } else {
          return res.status(400).json({ message: "Insufficient balance" });
        }
      } else {
        return res
          .status(400)
          .json({ message: "Step is not valid for deduction" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  };


  
  User_Router.post("/balance-cut",Check_token_MiddleWare, Balance_Cut_Controller);
  User_Router.post("/update-step",Check_token_MiddleWare, updateStepController);