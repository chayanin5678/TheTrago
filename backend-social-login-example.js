// Backend API Example for Social Login
// ไฟล์นี้เป็นตัวอย่างสำหรับ Backend Developer

/*
POST /social-login
Content-Type: application/json

Request Body:
{
  "provider": "google" | "facebook",
  "providerId": "12345...", // ID จาก Google หรือ Facebook
  "email": "user@example.com",
  "name": "User Name", 
  "photo": "https://profile-photo-url"
}

Response:
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "avatar": "https://profile-photo-url",
    "provider": "google",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
*/

// Laravel/PHP Example:
/*
Route::post('/social-login', function(Request $request) {
    $provider = $request->input('provider');
    $providerId = $request->input('providerId');
    $email = $request->input('email');
    $name = $request->input('name');
    $photo = $request->input('photo');
    
    // ตรวจสอบว่า user มีอยู่แล้วหรือไม่
    $user = User::where('email', $email)
                ->orWhere('provider_id', $providerId)
                ->first();
    
    if (!$user) {
        // สร้าง user ใหม่
        $user = User::create([
            'email' => $email,
            'name' => $name,
            'avatar' => $photo,
            'provider' => $provider,
            'provider_id' => $providerId,
            'email_verified_at' => now(), // ถือว่า verified แล้วจาก social
        ]);
    } else {
        // อัปเดตข้อมูล user ที่มีอยู่
        $user->update([
            'name' => $name,
            'avatar' => $photo,
        ]);
    }
    
    // สร้าง JWT token
    $token = JWTAuth::fromUser($user);
    
    return response()->json([
        'token' => $token,
        'user' => $user
    ]);
});
*/

// Node.js/Express Example:
/*
app.post('/social-login', async (req, res) => {
    const { provider, providerId, email, name, photo } = req.body;
    
    try {
        // ตรวจสอบว่า user มีอยู่แล้วหรือไม่
        let user = await User.findOne({
            $or: [
                { email: email },
                { providerId: providerId }
            ]
        });
        
        if (!user) {
            // สร้าง user ใหม่
            user = new User({
                email,
                name,
                avatar: photo,
                provider,
                providerId,
                emailVerified: true
            });
            await user.save();
        } else {
            // อัปเดตข้อมูล user ที่มีอยู่
            user.name = name;
            user.avatar = photo;
            await user.save();
        }
        
        // สร้าง JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                provider: user.provider
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Social login failed' });
    }
});
*/
