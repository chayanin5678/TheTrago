import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Platform, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import ipAddress from '../config/ipconfig';

const AddPhotoScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access media library is required.');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.cancelled) {
        setImage(result);
      }
    } catch (err) {
      setError('Image pick failed.');
    }
  };

  const takePhoto = async () => {
    setError(null);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError('Camera permission required.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });
      if (!result.cancelled) {
        setImage(result);
      }
    } catch (err) {
      setError('Camera failed.');
    }
  };

  const uploadImage = async () => {
    if (!image || !image.uri) return;
    setUploading(true);
    setError(null);

    try {
      const uri = image.uri;
      const filename = uri.split('/').pop();
      const match = /\.([0-9a-z]+)(?:[?#]|$)/i.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const form = new FormData();
      form.append('file', {
        uri: uri,
        name: filename,
        type,
      });

      // Assumption: backend accepts multipart POST at `${ipAddress}/upload`.
      // Adjust the endpoint if your backend expects a different path.
      const url = `${ipAddress}/upload`;

      const resp = await axios.post(url, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploading(false);

      // Navigate back or show success -- adapt to your flow
      navigation.goBack();
    } catch (err) {
      setUploading(false);
      setError('Upload failed.');
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Upload Photo</Text>

        <View style={{ width: '100%', height: 300, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: 12, justifyContent: 'center', alignItems: 'center' }}>
          {image ? (
            <Image source={{ uri: image.uri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
          ) : (
            <Text style={{ color: '#6b7280' }}>No image selected</Text>
          )}
        </View>

        {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}

        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={pickImage} style={{ flex: 1, marginRight: 8, padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8, alignItems: 'center' }}>
            <Text>Pick from library</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={takePhoto} style={{ flex: 1, marginLeft: 8, padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8, alignItems: 'center' }}>
            <Text>Take photo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={uploadImage}
          disabled={uploading || !image}
          style={{ marginTop: 16, width: '100%', padding: 14, backgroundColor: uploading || !image ? '#f3f4f6' : '#FD501E', borderRadius: 8, alignItems: 'center' }}
        >
          {uploading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: uploading || !image ? '#9ca3af' : '#fff', fontWeight: '700' }}>Upload</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddPhotoScreen;
