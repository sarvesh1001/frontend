import { StackNavigationProp } from '@react-navigation/stack';
import { Buffer } from 'buffer';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Button from '../components/Button';
import { AuthService } from '../services/auth';
import { theme } from '../styles/theme';
import { hp, wp } from '../utils/responsive';

type RootStackParamList = {
  Home: undefined;
  QrScanner: undefined;
};

type QrScannerScreenNavigationProp =
  StackNavigationProp<RootStackParamList, 'QrScanner'>;

interface Props {
  navigation: QrScannerScreenNavigationProp;
}

const QrScannerScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(true);  // 🚀 PRODUCTION FIX
  const [facing, setFacing] = useState<CameraType>('back');

  // 🔒 SAFE GO BACK
  const safeGoBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  };

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!cameraActive) return;     // prevent re-scanning
    setCameraActive(false);        // 🚀 immediately disable camera

    Alert.alert(
      "Web Login Confirmation",
      "Do you want to login to Prayantra Web?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            // re-enable camera only if user cancels
            setCameraActive(true);
          }
        },
        {
          text: "Yes, Login",
          onPress: () => pairWithWeb(data)
        }
      ]
    );
  };

  const pairWithWeb = async (qrData: string) => {
    try {
      console.log("RAW QR:", qrData);

      const normalizeBase64 = (str: string) =>
        str.replace(/-/g, '+')
           .replace(/_/g, '/')
           .padEnd(str.length + (4 - (str.length % 4)) % 4, '=');

      const decodedData = Buffer
        .from(normalizeBase64(qrData), "base64")
        .toString("utf8");

      const qrPayload = JSON.parse(decodedData);
      const sessionId = qrPayload.sid;

      await AuthService.pairWebLogin(sessionId, qrData);

      Alert.alert(
        "Success!",
        "Web login initiated! Please check your browser.",
        [{ text: "OK", onPress: safeGoBack }]
      );

    } catch (error: any) {
      console.error("Pairing error:", error);

      let errorMessage = error.response?.data?.message ??
                         error.message ??
                         "Failed to pair with web login.";

      Alert.alert(
        "Error",
        errorMessage,
        [
          { text: "Try Again", onPress: () => setCameraActive(true) },
          { text: "Cancel", style: "cancel", onPress: safeGoBack }
        ]
      );
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          Prayantra needs access to your camera to scan QR codes.
        </Text>

        <Button
          title="Grant Permission"
          onPress={requestPermission}
          fullWidth
          style={styles.permissionButton}
        />

        <Button
          title="Go Back"
          onPress={safeGoBack}
          variant="outline"
          fullWidth
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cameraActive && (  // 🚀 CAMERA ONLY MOUNTS WHEN ACTIVE
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        >
          <View style={styles.overlay}>
            <View style={styles.topOverlay} />

            <View style={styles.middleOverlay}>
              <View style={styles.sideOverlay} />
              <View style={styles.scanFrame}>
                <View style={styles.cornerTopLeft} />
                <View style={styles.cornerTopRight} />
                <View style={styles.cornerBottomLeft} />
                <View style={styles.cornerBottomRight} />
              </View>
              <View style={styles.sideOverlay} />
            </View>

            <View style={styles.bottomOverlay}>
              <Text style={styles.scanText}>
                Align QR code within the frame to scan
              </Text>
            </View>
          </View>
        </CameraView>
      )}

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
          <Text style={styles.controlButtonText}>Flip Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.cancelButton]}
          onPress={safeGoBack}
        >
          <Text style={styles.controlButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles (unchanged)
const { width } = Dimensions.get("window");
const scanFrameSize = width * 0.7;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp("8%"),
    backgroundColor: theme.colors.background,
  },
  permissionTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp("2%"),
    textAlign: "center",
  },
  permissionText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: hp("4%"),
    lineHeight: 20,
  },
  permissionButton: { marginBottom: hp("2%") },
  backButton: { marginBottom: hp("2%") },
  camera: { flex: 1 },
  overlay: { flex: 1 },
  topOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  middleOverlay: { flexDirection: "row", height: scanFrameSize },
  sideOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  scanFrame: { width: scanFrameSize, height: scanFrameSize },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanText: { color: "white", fontSize: 16, fontWeight: "500" },
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: theme.colors.primary,
    width: 30,
    height: 30,
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderColor: theme.colors.primary,
    width: 30,
    height: 30,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: theme.colors.primary,
    width: 30,
    height: 30,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: theme.colors.primary,
    width: 30,
    height: 30,
  },
  controls: {
    position: "absolute",
    bottom: hp("6%"),
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: wp("8%"),
  },
  controlButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("6%"),
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  cancelButton: { backgroundColor: "rgba(255,82,82,0.8)" },
  controlButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
});

export default QrScannerScreen;




// import { StackNavigationProp } from '@react-navigation/stack';
// import { Buffer } from 'buffer';
// import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
// import React, { useEffect, useState } from 'react';
// import {
//     Alert,
//     Dimensions,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from 'react-native';
// import Button from '../components/Button';
// import { AuthService } from '../services/auth';
// import { theme } from '../styles/theme';
// import { hp, wp } from '../utils/responsive';

// type RootStackParamList = {
//   Home: undefined;
//   QrScanner: undefined;
// };

// type QrScannerScreenNavigationProp =
//   StackNavigationProp<RootStackParamList, 'QrScanner'>;

// interface Props {
//   navigation: QrScannerScreenNavigationProp;
// }

// const QrScannerScreen: React.FC<Props> = ({ navigation }) => {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [scanned, setScanned] = useState(false);
//   const [facing, setFacing] = useState<CameraType>('back');

//   // 🔒 SAFE GO BACK FUNCTION
//   const safeGoBack = () => {
//     if (navigation.canGoBack()) {
//       navigation.goBack();
//     } else {
//       navigation.navigate('Home');
//     }
//   };

//   useEffect(() => {
//     if (!permission?.granted) {
//       requestPermission();
//     }
//   }, [permission]);

//   const handleBarCodeScanned = ({ data }: { data: string }) => {
//     if (scanned) return;

//     setScanned(true);

//     Alert.alert(
//       'Web Login Confirmation',
//       'Do you want to login to Prayantra Web?',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//           onPress: () => setScanned(false),
//         },
//         {
//           text: 'Yes, Login',
//           onPress: () => pairWithWeb(data),
//         },
//       ]
//     );
//   };

//   const pairWithWeb = async (qrData: string) => {
//     try {
//       console.log('🔍 RAW QR DATA:', JSON.stringify(qrData));

//       const normalizeBase64 = (str: string) =>
//         str
//           .replace(/-/g, '+')
//           .replace(/_/g, '/')
//           .padEnd(str.length + (4 - ((str.length % 4) || 4)) % 4, '=');

//       const decodedData = Buffer.from(
//         normalizeBase64(qrData),
//         'base64'
//       ).toString('utf8');

//       console.log('🔍 DECODED STRING:', decodedData);

//       const qrPayload = JSON.parse(decodedData);
//       console.log('🧩 PARSED PAYLOAD:', qrPayload);

//       const sessionId = qrPayload.sid;
//       console.log('🆔 Session ID:', sessionId);

//       await AuthService.pairWebLogin(sessionId, qrData);

//       Alert.alert('Success!', 'Web login initiated! Please check your web browser.', [
//         { text: 'OK', onPress: safeGoBack },
//       ]);
//     } catch (error: any) {
//       console.error('❌ Pairing error:', error);

//       let errorMessage = 'Failed to pair with web login.';
//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.message) {
//         errorMessage = error.message;
//       }

//       Alert.alert('Error', errorMessage, [
//         { text: 'Try Again', onPress: () => setScanned(false) },
//         { text: 'Cancel', style: 'cancel', onPress: safeGoBack },
//       ]);
//     }
//   };

//   const toggleCameraFacing = () => {
//     setFacing((current) => (current === 'back' ? 'front' : 'back'));
//   };

//   if (!permission) {
//     return (
//       <View style={styles.container}>
//         <Text>Requesting camera permission...</Text>
//       </View>
//     );
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.permissionContainer}>
//         <Text style={styles.permissionTitle}>Camera Permission Required</Text>
//         <Text style={styles.permissionText}>
//           Prayantra needs access to your camera to scan QR codes for web login.
//         </Text>

//         <Button
//           title="Grant Permission"
//           onPress={requestPermission}
//           fullWidth
//           style={styles.permissionButton}
//         />

//         <Button
//           title="Go Back"
//           onPress={safeGoBack}
//           variant="outline"
//           fullWidth
//           style={styles.backButton}
//         />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <CameraView
//         style={styles.camera}
//         facing={facing}
//         onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
//         barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
//       >
//         <View style={styles.overlay}>
//           <View style={styles.topOverlay} />

//           <View style={styles.middleOverlay}>
//             <View style={styles.sideOverlay} />

//             <View style={styles.scanFrame}>
//               <View style={styles.cornerTopLeft} />
//               <View style={styles.cornerTopRight} />
//               <View style={styles.cornerBottomLeft} />
//               <View style={styles.cornerBottomRight} />
//             </View>

//             <View style={styles.sideOverlay} />
//           </View>

//           <View style={styles.bottomOverlay}>
//             <Text style={styles.scanText}>
//               Align QR code within the frame to scan
//             </Text>
//           </View>
//         </View>
//       </CameraView>

//       <View style={styles.controls}>
//         <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
//           <Text style={styles.controlButtonText}>Flip Camera</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.controlButton, styles.cancelButton]}
//           onPress={safeGoBack}
//         >
//           <Text style={styles.controlButtonText}>Cancel</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const { width } = Dimensions.get('window');
// const scanFrameSize = width * 0.7;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   permissionContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: wp('8%'),
//     backgroundColor: theme.colors.background,
//   },
//   permissionTitle: {
//     fontSize: theme.typography.h2.fontSize,
//     fontWeight: '600',
//     color: theme.colors.text,
//     marginBottom: hp('2%'),
//     textAlign: 'center',
//   },
//   permissionText: {
//     fontSize: theme.typography.body.fontSize,
//     color: theme.colors.textSecondary,
//     textAlign: 'center',
//     marginBottom: hp('4%'),
//     lineHeight: 20,
//   },
//   permissionButton: {
//     marginBottom: hp('2%'),
//   },
//   backButton: {
//     marginBottom: hp('2%'),
//   },
//   camera: {
//     flex: 1,
//   },
//   overlay: {
//     flex: 1,
//   },
//   topOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//   },
//   middleOverlay: {
//     flexDirection: 'row',
//     height: scanFrameSize,
//   },
//   sideOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//   },
//   scanFrame: {
//     width: scanFrameSize,
//     height: scanFrameSize,
//     backgroundColor: 'transparent',
//   },
//   bottomOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   scanText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
//   cornerTopLeft: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     borderLeftWidth: 4,
//     borderTopWidth: 4,
//     borderColor: theme.colors.primary,
//     width: 30,
//     height: 30,
//   },
//   cornerTopRight: {
//     position: 'absolute',
//     top: 0,
//     right: 0,
//     borderRightWidth: 4,
//     borderTopWidth: 4,
//     borderColor: theme.colors.primary,
//     width: 30,
//     height: 30,
//   },
//   cornerBottomLeft: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     borderLeftWidth: 4,
//     borderBottomWidth: 4,
//     borderColor: theme.colors.primary,
//     width: 30,
//     height: 30,
//   },
//   cornerBottomRight: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     borderRightWidth: 4,
//     borderBottomWidth: 4,
//     borderColor: theme.colors.primary,
//     width: 30,
//     height: 30,
//   },
//   controls: {
//     position: 'absolute',
//     bottom: hp('6%'),
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingHorizontal: wp('8%'),
//   },
//   controlButton: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingVertical: hp('1.5%'),
//     paddingHorizontal: wp('6%'),
//     borderRadius: 25,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.3)',
//   },
//   cancelButton: {
//     backgroundColor: 'rgba(255,82,82,0.8)',
//   },
//   controlButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default QrScannerScreen;
