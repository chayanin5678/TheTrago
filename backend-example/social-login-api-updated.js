const express = require('express');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const axios = require('axios');

const app = express();
app.use(express.json());

// JWKS client for Apple's public keys
const client = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys'
});

// Function to get Apple's signing key
function getAppleSigningKey(kid) {
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) {
        reject(err);
      } else {
        const signingKey = key.publicKey || key.rsaPublicKey;
        resolve(signingKey);
      }
    });
  });
}

// Function to verify Apple identity token (updated for @invertase/react-native-apple-authentication)
async function verifyAppleIdentityToken(identityToken, audience) {
  try {
    // Decode JWT header to get kid
    const header = jwt.decode(identityToken, { complete: true })?.header;
    if (!header || !header.kid) {
      throw new Error('Invalid identity token header');
    }

    // Get Apple's signing key
    const signingKey = await getAppleSigningKey(header.kid);

    // Verify the token
    const decoded = jwt.verify(identityToken, signingKey, {
      issuer: 'https://appleid.apple.com',
      audience: audience, // Should match your app's bundle ID or client ID
      algorithms: ['RS256']
    });

    return decoded;
  } catch (error) {
    console.error('Apple token verification failed:', error);
    throw error;
  }
}

// Social Login API endpoint (updated for @invertase/react-native-apple-authentication)
app.post('/AppApi/social-login', async (req, res) => {
  try {
    const { 
      provider, 
      providerId, 
      email, 
      name, 
      firstName, 
      lastName, 
      photo, 
      identityToken, 
      authorizationCode,
      audience,
      aud,
      nonce
    } = req.body;

    console.log('Social login request:', { provider, providerId, email, audience: audience || aud });

    if (provider === 'apple') {
      // For Apple Sign-In with @invertase/react-native-apple-authentication
      if (!identityToken) {
        return res.status(400).json({
          status: 'error',
          message: 'Identity token is required for Apple Sign-In'
        });
      }

      try {
        // Use audience or aud field (client sends both for compatibility)
        const audienceToVerify = audience || aud;
        if (!audienceToVerify) {
          return res.status(400).json({
            status: 'error',
            message: 'Audience is required for Apple token verification'
          });
        }

        // Verify Apple identity token
        const verifiedPayload = await verifyAppleIdentityToken(identityToken, audienceToVerify);
        console.log('Apple token verified successfully:', {
          sub: verifiedPayload.sub,
          email: verifiedPayload.email,
          aud: verifiedPayload.aud
        });

        // Use email from verified token if not provided
        const verifiedEmail = email || verifiedPayload.email;
        const verifiedProviderId = providerId || verifiedPayload.sub;

        // Check if user exists in database
        // This is where you'd implement your database logic
        console.log('Processing Apple user:', {
          providerId: verifiedProviderId,
          email: verifiedEmail,
          name,
          firstName,
          lastName
        });

        // For demo purposes, create a JWT token
        const userToken = jwt.sign(
          { 
            id: verifiedProviderId, 
            email: verifiedEmail,
            provider: 'apple',
            name: name || `${firstName || ''} ${lastName || ''}`.trim()
          },
          'your-secret-key',
          { expiresIn: '30d' }
        );

        return res.json({
          status: 'success',
          message: 'Apple sign-in successful',
          token: userToken,
          user: {
            id: verifiedProviderId,
            email: verifiedEmail,
            name: name || `${firstName || ''} ${lastName || ''}`.trim(),
            provider: 'apple'
          }
        });

      } catch (verificationError) {
        console.error('Apple token verification failed:', verificationError);
        return res.status(400).json({
          status: 'error',
          message: 'Invalid Apple identity token',
          detail: verificationError.message
        });
      }
    }

    // Handle other providers (Google, Facebook)
    else if (provider === 'google') {
      // Google Sign-In logic (unchanged)
      console.log('Processing Google user:', { providerId, email, name });
      
      const userToken = jwt.sign(
        { 
          id: providerId, 
          email,
          provider: 'google',
          name
        },
        'your-secret-key',
        { expiresIn: '30d' }
      );

      return res.json({
        status: 'success',
        message: 'Google sign-in successful',
        token: userToken,
        user: {
          id: providerId,
          email,
          name,
          provider: 'google'
        }
      });
    }

    else if (provider === 'facebook') {
      // Facebook Login logic (unchanged)
      console.log('Processing Facebook user:', { providerId, email, name });
      
      const userToken = jwt.sign(
        { 
          id: providerId, 
          email,
          provider: 'facebook',
          name
        },
        'your-secret-key',
        { expiresIn: '30d' }
      );

      return res.json({
        status: 'success',
        message: 'Facebook sign-in successful',
        token: userToken,
        user: {
          id: providerId,
          email,
          name,
          provider: 'facebook'
        }
      });
    }

    else {
      return res.status(400).json({
        status: 'error',
        message: 'Unsupported provider'
      });
    }

  } catch (error) {
    console.error('Social login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      detail: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Social login endpoint: POST /AppApi/social-login');
  console.log('Updated for @invertase/react-native-apple-authentication');
});

module.exports = app;
