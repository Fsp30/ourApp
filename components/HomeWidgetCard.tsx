import { Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { FolderIcon } from "@/components/FolderIcons";
import { HomeWidget, PhotoEntry, PostIt, Folder } from "@/types";

const POSTIT_COLORS = ["#F4C978", "#F0A6A0", "#A9C9A4"];
const POSTIT_ROTATIONS = ["-rotate-2", "rotate-1", "-rotate-1"];

type Props = {
    widget: HomeWidget;
    theme: any;
    photo?: PhotoEntry;
    postIt?: PostIt;
    folder?: Folder;
    driveToken: string | null;
    editing: boolean;
    index: number;
    onPress: () => void;
    onRemove: () => void;
    onDrag: () => void;
};

export function HomeWidgetCard({
    widget,
    theme,
    photo,
    postIt,
    folder,
    driveToken,
    editing,
    index,
    onPress,
    onRemove,
    onDrag,
}: Props) {
    return (
        <TouchableOpacity
            onPress={editing ? undefined : onPress}
            onLongPress={editing ? onDrag : undefined}
            delayLongPress={150}
            activeOpacity={0.85}
        >
            <Box
                className="rounded-2xl border p-4 mb-2 relative"
                style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                }}
            >
                {editing && (
                    <TouchableOpacity
                        onPress={onRemove}
                        hitSlop={10}
                        className="absolute top-1.5 right-1.5 z-10"
                    >
                        <Box className="w-6 h-6 rounded-full items-center justify-center bg-black/45">
                            <Text className="text-white text-xs leading-3">
                                ×
                            </Text>
                        </Box>
                    </TouchableOpacity>
                )}

                {widget.type === "photo" && (
                    <VStack space="sm">
                        {photo && driveToken ? (
                            <Image
                                source={{
                                    uri: `https://www.googleapis.com/drive/v3/files/${photo.id}?alt=media`,
                                    headers: {
                                        Authorization: `Bearer ${driveToken}`,
                                    },
                                }}
                                className="w-full h-40 rounded-xl"
                                resizeMode="cover"
                            />
                        ) : (
                            <Box
                                className="w-full h-40 rounded-xl"
                                style={{ backgroundColor: theme.surfaceAlt }}
                            />
                        )}
                        <Text
                            className="text-sm font-semibold"
                            style={{ color: theme.text }}
                        >
                            {photo ? "Foto recente" : "Nenhuma foto ainda"}
                        </Text>
                    </VStack>
                )}

                {widget.type === "postit" && (
                    <Box
                        className={`rounded-lg p-3 min-h-20 justify-center shadow-md ${POSTIT_ROTATIONS[index % POSTIT_ROTATIONS.length]}`}
                        style={{
                            backgroundColor:
                                POSTIT_COLORS[index % POSTIT_COLORS.length],
                        }}
                    >
                        <Text
                            className="text-sm"
                            style={{ color: "rgba(0,0,0,0.75)" }}
                            numberOfLines={3}
                        >
                            {postIt ? postIt.content : "Nenhum recado ainda"}
                        </Text>
                        {postIt && (
                            <Text
                                className="text-[10px] mt-1"
                                style={{ color: "rgba(0,0,0,0.5)" }}
                            >
                                {(widget.recencyIndex ?? 0) === 0
                                    ? "mais recente"
                                    : `${(widget.recencyIndex ?? 0) + 1}º mais recente`}
                            </Text>
                        )}
                    </Box>
                )}

                {widget.type === "pasta" && (
                    <HStack space="sm" className="items-center">
                        <FolderIcon
                            accent={theme.accent}
                            surface={theme.surface}
                        />
                        <VStack>
                            <Text
                                className="text-sm font-semibold"
                                style={{ color: theme.text }}
                            >
                                {folder?.name ?? "Pasta removida"}
                            </Text>
                            <Text
                                className="text-[10.5px]"
                                style={{ color: theme.textMuted }}
                            >
                                toque para abrir
                            </Text>
                        </VStack>
                    </HStack>
                )}
            </Box>
        </TouchableOpacity>
    );
}
