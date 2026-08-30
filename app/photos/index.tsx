import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { Background } from "@/components/Background";
import { font, spacing } from "@/constants/theme";
import { useTheme } from "@/constants/ThemeContext";
import { isGoogleConnected } from "@/services/auth/googleAuth";
import { getDriveToken } from "@/services/drive/photoService";
import { usePhotos } from "@/hooks/usePhotos";
import { loadActiveUser } from "@/storage/user";
import { PhotoEntry, UserId } from "@/types";
import {
    getOtherUser,
    sendPushNotification,
} from "@/services/notifications/pushTokenService";

const COLUMN_COUNT = 3;
const GAP = 8;
const SCREEN_WIDTH = Dimensions.get("window").width;
const TILE_SIZE = (SCREEN_WIDTH - GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

export default function PhotosScreen() {
    const router = useRouter();
    const { theme, setPhotoBackground } = useTheme();
    const {
        photos,
        loading: photosLoading,
        addPhoto,
        removePhoto,
    } = usePhotos();
    const [driveToken, setDriveToken] = useState<string | null>(null);
    const [checkingConnection, setCheckingConnection] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [notConnected, setNotConnected] = useState(false);

    useFocusEffect(
        useCallback(() => {
            async function checkConnection() {
                setCheckingConnection(true);

                const connected = await isGoogleConnected();
                if (!connected) {
                    setNotConnected(true);
                    setCheckingConnection(false);
                    return;
                }

                setNotConnected(false);
                const token = await getDriveToken();
                setDriveToken(token);
                setCheckingConnection(false);
            }
            checkConnection();
        }, []),
    );

    const loading = checkingConnection || photosLoading;

    async function handleUpload() {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.8,
            allowsMultipleSelection: false,
        });

        if (result.canceled || !result.assets[0]) return;

        const asset = result.assets[0];
        const user = await loadActiveUser();
        if (!user) return;

        setUploading(true);
        const fileName = asset.fileName ?? `photo_${Date.now()}.jpg`;
        const mimeType = asset.mimeType ?? "image/jpeg";

        const entry = await addPhoto(
            asset.uri,
            fileName,
            mimeType,
            user as UserId,
        );
        if (entry) {
            const other = getOtherUser(user as UserId);
            await sendPushNotification(
                other,
                "📸 Nova foto",
                `${user} adicionou uma foto`,
            );
        }
        setUploading(false);
    }

    function handleSelectPhoto(photo: PhotoEntry) {
        Alert.alert("Opções", photo.name, [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Usar como fundo",
                onPress: () => {
                    setPhotoBackground(
                        `https://www.googleapis.com/drive/v3/files/${photo.id}?alt=media`,
                    );
                    router.back();
                },
            },
            {
                text: "Excluir",
                style: "destructive",
                onPress: async () => {
                    await removePhoto(photo.id);
                },
            },
        ]);
    }

    async function handleCamera() {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            allowsEditing: false,
        });

        if (result.canceled || !result.assets[0]) return;

        const asset = result.assets[0];
        const user = await loadActiveUser();
        if (!user) return;

        setUploading(true);
        const fileName = `photo_${Date.now()}.jpg`;
        const mimeType = asset.mimeType ?? "image/jpeg";

        const entry = await addPhoto(
            asset.uri,
            fileName,
            mimeType,
            user as UserId,
        );
        if (entry) {
            const other = getOtherUser(user as UserId);
            await sendPushNotification(
                other,
                "📸 Nova foto",
                `${user} adicionou uma foto`,
            );
        }
        setUploading(false);
    }

    if (loading) {
        return (
            <Background>
                <View style={styles.center}>
                    <ActivityIndicator color={theme.accent} size="large" />
                </View>
            </Background>
        );
    }

    if (notConnected) {
        return (
            <Background>
                <View style={styles.center}>
                    <Text style={[styles.message, { color: theme.textMuted }]}>
                        Conecte sua conta Google nas configurações para ver as
                        fotos.
                    </Text>
                </View>
            </Background>
        );
    }

    return (
        <Background>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={[styles.back, { color: theme.accent }]}>
                            ‹ Voltar
                        </Text>
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>
                        Fotos
                    </Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={handleCamera}
                            disabled={uploading}
                        >
                            <Text
                                style={[
                                    styles.actionBtn,
                                    { color: theme.accent },
                                ]}
                            >
                                {uploading ? "..." : "⊙"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleUpload}
                            disabled={uploading}
                        >
                            <Text
                                style={[
                                    styles.actionBtn,
                                    { color: theme.accent },
                                ]}
                            >
                                +
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {photos.length === 0 ? (
                    <View style={styles.center}>
                        <Text
                            style={[styles.message, { color: theme.textMuted }]}
                        >
                            Nenhuma foto ainda. Toque em + para adicionar.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={photos}
                        keyExtractor={(item) => item.id}
                        numColumns={COLUMN_COUNT}
                        contentContainerStyle={styles.grid}
                        columnWrapperStyle={{ gap: GAP }}
                        ItemSeparatorComponent={() => (
                            <View style={{ height: GAP }} />
                        )}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => handleSelectPhoto(item)}
                                activeOpacity={0.8}
                            >
                                {driveToken ? (
                                    <Image
                                        source={{
                                            uri: `https://www.googleapis.com/drive/v3/files/${item.id}?alt=media`,
                                            headers: {
                                                Authorization: `Bearer ${driveToken}`,
                                            },
                                        }}
                                        style={styles.tile}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View
                                        style={[
                                            styles.tile,
                                            { backgroundColor: theme.surface },
                                        ]}
                                    />
                                )}
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </Background>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.md,
    },
    back: { fontSize: font.sizes.md },
    title: { fontSize: font.sizes.lg, fontWeight: "700" },
    uploadBtn: { fontSize: font.sizes.xxl, fontWeight: "700", lineHeight: 32 },
    message: {
        fontSize: font.sizes.md,
        textAlign: "center",
        lineHeight: 22,
    },
    grid: { padding: GAP },
    tile: {
        width: TILE_SIZE,
        height: TILE_SIZE,
        borderRadius: 2,
    },
    headerActions: {
        flexDirection: "row",
        gap: spacing.md,
        alignItems: "center",
    },
    actionBtn: {
        fontSize: font.sizes.xxl,
        fontWeight: "700",
        lineHeight: 32,
    },
});
