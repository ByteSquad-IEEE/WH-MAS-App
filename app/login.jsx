import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Poppins_400Regular,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import * as SplashScreen from "expo-splash-screen";
import { router, useRouter } from "expo-router";

// SplashScreen.preventAutoHideAsync();

const FloatingLabelInput = ({ label, value, onChangeText, keyboardType, secureTextEntry }) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedLabel, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: "absolute",
    left: 0,
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 0],
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: ["#aaa", "#000"],
    }),
  };

  return (
    <View style={{ paddingTop: 18 }}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        value={value}
        style={styles.input}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}  
        placeholder={isFocused ? "" : label}
        placeholderTextColor="#aaa"
      />
    </View>
  );
};

const LoginScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 

  const base_url = "https://whmas-admin.vercel.app"; 

  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const saveEmailToStorage = async (email) => {
    try {
      await AsyncStorage.setItem("userEmail", email);
    } catch (error) {
      console.error("Failed to save email to storage:", error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      console.log("Sending login request...");
      const response = await fetch(`${base_url}/wh-mas/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
  
      console.log("Response status:", response.status);
  
      const data = await response.json();
      console.log("Response data:", data);
  
      if (response.ok) {
        setLoading(false);
        await saveEmailToStorage(email);
        await AsyncStorage.setItem("userId", data.message.success.id);
        console.log(data.message.success.id)
        router.push("/dashboard");
      } else {
        setLoading(false);
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Fetch error:", error); 
      setError("An unexpected error occurred. Please try again.");
    }
  };

    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("userId");
      if (token) {
        router.push("/home");
      }
    };

    useEffect(() => {
      checkLoginStatus();
    }, []);
  
  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      onLayout={onLayoutRootView}
    >
      <ImageBackground
        source={require("../assets/authBgPatternImg.png")}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Login</Text>
        <Text style={styles.subHeaderText}>
          Welcome Back, Login to access your account
        </Text>
      </ImageBackground>

      <View style={styles.form}>
        <FloatingLabelInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <FloatingLabelInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          keyboardType="default"
          secureTextEntry={true} 
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        {loading ? (
          <ActivityIndicator size="large" color="#00C853" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerText}>
          Don't have an account?{" "}
          <Text
            style={styles.linkText}
            onPress={() => navigation.navigate("register")}
          >
            Register
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  backButton: {
    marginBottom: 10,
    display: "flex",
    backgroundColor: "green",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 999,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
  header: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: "flex-start",
    height: 290,
  },
  headerText: {
    color: "#fff",
    fontSize: 30,
    fontFamily: "Poppins_700Bold",
  },
  subHeaderText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    fontFamily: "Poppins_400Regular",
  },
  form: {
    marginTop: -45,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    elevation: 5,
    width: "90%",
    display: "flex",
    gap: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#727272",
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    fontFamily: "Poppins_400Regular",
  },
  button: {
    backgroundColor: "#00C853",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    fontFamily: "Poppins_400Regular",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Poppins_400Regular",
  },
  errorText: {
    color: "red",
    marginBottom: 15,
    fontFamily: "Poppins_400Regular",
  },
  footerText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  linkText: {
    color: "#00C853",
    fontWeight: "bold",
  },
});

export default LoginScreen;
