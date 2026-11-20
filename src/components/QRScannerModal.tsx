import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  BackHandler,
  Linking,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { DemoBadge } from './DemoBadge';

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function QRScannerModal({ visible, onClose }: QRScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const isScanningLocked = useRef(false);

  // Handle hardware back press
  useEffect(() => {
    if (!visible) return;

    const onBackPress = () => {
      if (scannedData !== null) {
        setScannedData(null);
        isScanningLocked.current = false;
        return true;
      }
      onClose();
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [visible, scannedData, onClose]);

  // Reset lock when modal opens or closes
  useEffect(() => {
    if (visible) {
      isScanningLocked.current = false;
      setScannedData(null);
      setTorchEnabled(false);
      setCopiedFeedback(false);
    }
  }, [visible]);

  const handleBarcodeScanned = (result: { type: string; data: string }) => {
    if (isScanningLocked.current) return;
    isScanningLocked.current = true;
    setScannedData(result.data);
  };

  const handleCopy = () => {
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  };

  const handleScanAgain = () => {
    setScannedData(null);
    setCopiedFeedback(false);
    setTimeout(() => {
      isScanningLocked.current = false;
    }, 500);
  };

  const isUrl = scannedData?.startsWith('http://') || scannedData?.startsWith('https://');
  const isUpi = scannedData?.toLowerCase().startsWith('upi://');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Navigation Bar */}
        <View style={styles.navHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.navIconButton}
            activeOpacity={0.7}
            accessibilityLabel="Close scanner">
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.navTitle}>Scan QR Code</Text>
            <DemoBadge />
          </View>

          {permission?.granted ? (
            <TouchableOpacity
              onPress={() => setTorchEnabled((prev) => !prev)}
              style={[styles.torchBtn, torchEnabled && styles.torchBtnActive]}
              activeOpacity={0.7}
              accessibilityLabel="Toggle flashlight">
              <Ionicons
                name={torchEnabled ? 'flash' : 'flash-outline'}
                size={20}
                color={torchEnabled ? Colors.brandNu : Colors.textPrimary}
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* 1. Permission Undetermined or Denied */}
        {!permission?.granted ? (
          <View style={styles.permissionCard}>
            <View style={styles.permissionIconCircle}>
              <Ionicons name="camera-outline" size={48} color={Colors.primary} />
            </View>

            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionSubtitle}>
              G Pay.nu uses the camera exclusively on this device to decode QR
              codes for simulation. No images, video, or scan data are uploaded
              or shared.
            </Text>

            <View style={styles.guaranteeBox}>
              <View style={styles.guaranteeItem}>
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color={Colors.brandNu}
                />
                <Text style={styles.guaranteeText}>
                  100% On-Device Processing
                </Text>
              </View>
              <View style={styles.guaranteeItem}>
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color={Colors.brandNu}
                />
                <Text style={styles.guaranteeText}>
                  Zero Payment Execution from QR
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.allowButton}
              onPress={requestPermission}
              activeOpacity={0.8}>
              <Text style={styles.allowButtonText}>Allow Camera Access</Text>
            </TouchableOpacity>

            {permission?.canAskAgain === false && (
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => Linking.openSettings()}
                activeOpacity={0.7}>
                <Text style={styles.settingsButtonText}>Open System Settings</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : scannedData === null ? (
          /* 2. Active Camera View */
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFill}
              enableTorch={torchEnabled}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              onBarcodeScanned={handleBarcodeScanned}
            />

            {/* Darkened Reticle Overlay */}
            <View style={styles.overlay}>
              <View style={styles.overlayTop} />
              <View style={styles.overlayMiddle}>
                <View style={styles.overlaySide} />
                <View style={styles.reticle}>
                  {/* Corner Guides */}
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </View>
                <View style={styles.overlaySide} />
              </View>
              <View style={styles.overlayBottom}>
                <Text style={styles.helperText}>
                  Align QR code inside the frame
                </Text>
                <View style={styles.safetyChip}>
                  <Ionicons
                    name="shield-outline"
                    size={14}
                    color={Colors.brandNu}
                  />
                  <Text style={styles.safetyChipText}>
                    Simulated Scanner • Safe Preview
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* 3. Safe QR Preview Screen */
          <ScrollView
            style={styles.previewContainer}
            contentContainerStyle={styles.previewContent}>
            <View style={styles.previewSuccessIcon}>
              <Ionicons
                name="checkmark-circle"
                size={54}
                color={Colors.brandNu}
              />
            </View>

            <Text style={styles.previewTitle}>QR Code Scanned</Text>

            {/* Persistent Watermark Banner */}
            <View style={styles.watermarkBanner}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={Colors.primary}
              />
              <Text style={styles.watermarkText}>
                SAFE PREVIEW — NO PAYMENT INITIATED
              </Text>
            </View>

            {/* Warning Flags */}
            {isUpi && (
              <View style={styles.upiWarningBox}>
                <Ionicons name="alert-circle" size={20} color={Colors.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.warningHeading}>
                    UPI Payment String Detected
                  </Text>
                  <Text style={styles.warningBody}>
                    This is an independent demo simulator. Real UPI instructions
                    are NOT processed, verified, or executed.
                  </Text>
                </View>
              </View>
            )}

            {isUrl && (
              <View style={styles.urlWarningBox}>
                <Ionicons name="link-outline" size={20} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.warningHeading}>External Link Detected</Text>
                  <Text style={styles.warningBody}>
                    URLs are never opened automatically to ensure device safety.
                  </Text>
                </View>
              </View>
            )}

            {/* Decoded Content Card */}
            <View style={styles.contentCard}>
              <Text style={styles.contentCardLabel}>DECODED QR DATA</Text>
              <Text style={styles.contentCardText} selectable>
                {scannedData}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonGroup}>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={handleCopy}
                activeOpacity={0.8}>
                <Ionicons
                  name={copiedFeedback ? 'checkmark' : 'copy-outline'}
                  size={18}
                  color={Colors.textInverse}
                />
                <Text style={styles.copyBtnText}>
                  {copiedFeedback ? 'Copied' : 'Copy Scanned Text'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.scanAgainBtn}
                onPress={handleScanAgain}
                activeOpacity={0.7}>
                <Ionicons
                  name="scan-outline"
                  size={18}
                  color={Colors.primary}
                />
                <Text style={styles.scanAgainBtnText}>Scan Another Code</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navIconButton: {
    padding: Spacing.xs,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  navTitle: {
    ...Typography.title2,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  torchBtn: {
    padding: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceVariant,
  },
  torchBtnActive: {
    backgroundColor: 'rgba(16, 231, 195, 0.2)',
  },

  // Permission UI
  permissionCard: {
    flex: 1,
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  permissionIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(11, 87, 208, 0.08)',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  permissionTitle: {
    ...Typography.title1,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  permissionSubtitle: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  guaranteeBox: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 8,
    marginVertical: Spacing.sm,
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guaranteeText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  allowButton: {
    width: '100%',
    height: 50,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allowButtonText: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  settingsButton: {
    paddingVertical: 10,
  },
  settingsButtonText: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textTertiary,
  },

  // Active Camera Layout
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(9, 13, 22, 0.65)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 260,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(9, 13, 22, 0.65)',
  },
  reticle: {
    width: 260,
    height: 260,
    position: 'relative',
  },
  overlayBottom: {
    flex: 1.3,
    backgroundColor: 'rgba(9, 13, 22, 0.65)',
    alignItems: 'center',
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  helperText: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  safetyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(16, 231, 195, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 231, 195, 0.3)',
    gap: 6,
  },
  safetyChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.brandNu,
  },

  // Corner Guides
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: Colors.brandNu,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },

  // Preview Result Screen
  previewContainer: {
    flex: 1,
  },
  previewContent: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
  },
  previewSuccessIcon: {
    marginTop: Spacing.lg,
  },
  previewTitle: {
    ...Typography.title1,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  watermarkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 87, 208, 0.08)',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    gap: 8,
  },
  watermarkText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  upiWarningBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: Colors.warning,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 10,
  },
  urlWarningBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(11, 87, 208, 0.06)',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 10,
  },
  warningHeading: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  warningBody: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  contentCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: 8,
  },
  contentCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textTertiary,
    letterSpacing: 0.8,
  },
  contentCardText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 20,
  },
  actionButtonGroup: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  copyBtn: {
    flexDirection: 'row',
    height: 50,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  copyBtnText: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  scanAgainBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  scanAgainBtnText: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.primary,
  },
});
