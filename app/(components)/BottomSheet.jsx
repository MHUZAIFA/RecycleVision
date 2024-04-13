import { PRIMARY } from "@/lib/constants";
import { Modal, TouchableOpacity, View, Text, ActivityIndicator } from "react-native";
import { StyleSheet } from "react-native-web";
import { AntDesign } from '@expo/vector-icons';

// sample usage:
// < BottomSheet
//      isBottomSheetVisible = { bottomSheetVisible }
//      setIsBottomSheetVisible = { setBottomSheetVisible }
//      isLoading = { true }
// />

// BottomSheet component displays a modal bottom sheet with customizable content.
// - `bottomSheetVisible` (boolean, optional, default=false): Controls the visibility of the bottom sheet.
// - `setBottomSheetVisible` (function, optional): Function to toggle the visibility of the bottom sheet.
// - `displayHeader` (boolean, optional, default=true): Controls whether to display the header section.
// - `title` (string, optional, default='Title'): The title displayed in the header section.
// - `isLoading` (boolean, optional, default=false): Controls whether to display a loading indicator.
// - `content` (ReactNode, optional, default=defaultContent()): The main content of the bottom sheet.
// - `onClose` (function, optional, default=() => onCloseDefault(setBottomSheetVisible)): Function to handle the close event of the bottom sheet.
// - `displayCloseIconBtn` (boolean, optional, default=true): Controls whether to display the close icon button in the header.
// - `displayCloseBtn` (boolean, optional, default=true): Controls whether to display the close button at the bottom.
// - `closeBtnText` (string, optional, default="Close"): The text displayed on the close button.
// Returns: A React element representing the BottomSheet component.
const onCloseDefault = (setBottomSheetVisible) => {
    setBottomSheetVisible(false);
    console.log('Bottom sheet closed.');
}

const BottomSheet = (
        {
            isBottomSheetVisible = false,
            setIsBottomSheetVisible,
            displayHeader = true,
            title = 'Title',
            isLoading = false,
            content = defaultContent(),
            onClose = () => onCloseDefault(setIsBottomSheetVisible),
            displayCloseIconBtn = true,
            displayCloseBtn = true,
            closeBtnText = "Close"
        }
    ) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isBottomSheetVisible}
            onRequestClose={onClose}>
            <TouchableOpacity activeOpacity={1} style={styles.modalOverlay}>
                <View style={styles.bottomSheet}>
                    {
                        displayHeader && (
                            <View className="flex flex-row justify-between px-4 pt-5 pb-4 border-b-2 border-zinc-300">
                                <Text style={styles.bottomSheetTitle}>{title}</Text>
                                {
                                    displayCloseIconBtn &&
                                    (
                                        <TouchableOpacity onPress={onClose} style={styles.closeIconButton}>
                                            <AntDesign name="close" size={24} color="black" />
                                        </TouchableOpacity>
                                    )
                                }
                            </View>
                        )
                    }
                    <View className="flex p-4">
                        {isLoading ? <Loading /> : content}
                    </View>
                    {
                        displayCloseBtn &&
                        (
                            <View className="px-4 mb-8">
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Text style={styles.closeButtonText}>{closeBtnText}</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    }
                </View>
            </TouchableOpacity>
        </Modal>
    );
};


const Loading = () => {
    return (
        <View className="flex justify-center align-center">
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
};

const defaultContent = () => {
    return (<>
        <Text className="text-base">Content</Text>
    </>);
};

// styling
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    bottomSheet: {
        backgroundColor: "#ffffff",
        minHeight: 100,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        maxHeight: "90%",
    },
    bottomSheetTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#373737",
    },
    bottomSheetDescription: {
        fontSize: 15,
        marginTop: 10,
    },
    bottomSheetRecommendation: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#6342E8",
        marginTop: 10,
        textTransform: "capitalize",
    },
    bottomSuggestedBinTitle: {
        fontSize: 17,
        fontWeight: "500",
        marginTop: 10,
    },
    bottomSheetBinDescription: {
        fontSize: 15,
    },
    closeButton: {
        backgroundColor: PRIMARY,
        alignSelf: "center",
        width: "100%",
        padding: 17,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7
    },
    closeButtonText: {
        color: "white",
        fontSize: 15,
        alignSelf: "center",
    },
    bottomSheetBinTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginRight: 10,
    },
    blueBin: {
        color: "#0077c8",
    },
    greenBin: {
        color: "#228B22",
    },
    orangeBin: {
        color: "orangered",
    },
    blackBin: {
        color: "#171717",
    },
    tinyImg: {
        display: "flex",
        alignSelf: "flex-end",
        width: "100%",
        height: "100%",
        objectFit: "contain",
    },
});

export default BottomSheet;