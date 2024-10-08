import {
  Poppins_400Regular,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { router, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

// SplashScreen.preventAutoHideAsync();

const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
}) => {
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
  const [id, setId] = useState("");

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

  const storeUserData = async (userData) => {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      console.log("User data stored successfully");
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  };

  const getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData !== null) {
        const user = JSON.parse(userData);
        console.log("User data:", user);
        return user;
      } else {
        console.log("No user data found");
        return null;
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getUserData();
      if (user) {
        setId(user.id);
      }
    };

    fetchUserData();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Sending login request...", email, password);
      const response = await axios.post(`${base_url}/wh-mas/api/login`, {
        email,
        password,
      });

      if (response.status === 200) {
        const resData = response.data;
        const wallet_balance = resData.message.success.wallet_balance;
        const phone_number = resData.message.success.phone_number;
        const password = resData.message.success.password;
        const first_name = resData.message.success.first_name;
        const last_name = resData.message.success.last_name;
        const city = resData.message.success.city;
        const address = resData.message.success.address;
        const state = resData.message.success.state;
        const id = resData.message.success.id;

        const userData = {
          email,
          password,
          wallet_balance,
          phone_number,
          first_name,
          last_name,
          address,
          city,
          state,
          id,
        };
        storeUserData(userData);
        router.push("/dashboard");
        Toast.show({
          text1: "Login successful",
        });
        console.log("Response status:", response.status);
        console.log("Response Data:", resData);
      } else {
        setError("Invalid login credentials. Please try again.");
      }
    } catch (error) {
      if (error.response) {
        console.error("Response error:", error.response.data);
        setError(
          error.response.data.message || "Login failed. Please try again."
        );
      } else if (error.request) {
        console.error("Request error:", error.request);
        setError("No response from the server. Please check your connection.");
      } else {
        console.error("Post error:", error.message);
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const checkLoginStatus = async () => {
    if (id) {
      router.push("/dashboard");
      console.log(id);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
                onPress={() => router.push("register")}
              >
                Register
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
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
