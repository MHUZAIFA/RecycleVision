import { Text, View, Image, StyleSheet } from "react-native";
import blackBinImagePath from "../../assets/bins/black.png";
import blueBinImagePath from "../../assets/bins/blue.png";
import greenBinImagePath from "../../assets/bins/green.png";
import orangeBinImagePath from "../../assets/bins/orange.png";

// Define enum for bin types
const BinType = {
    BLUE: "blue",
    GREEN: "green",
    Orange: "orange",
    BLACK: "black",
};

// Define enum for recyclability
const Recyclability = {
    RECYCLABLE: "Recyclable",
    NON_RECYCLABLE: "Non Recyclable",
};

// Define dictionary with bin types, recyclability, and corresponding items
const binItems = {
    [BinType.BLUE]: {
        items: ["paper", "cardboard", "glass"],
        recyclability: Recyclability.RECYCLABLE,
    },
    [BinType.GREEN]: {
        items: ["plastic", "metal"],
        recyclability: Recyclability.RECYCLABLE,
    },
    [BinType.Orange]: {
        items: ["organics"],
        recyclability: Recyclability.RECYCLABLE,
    },
    [BinType.BLACK]: {
        items: ["trash"],
        recyclability: Recyclability.NON_RECYCLABLE,
    },
};

const PredictionResult = (prediction) => {
    const classification = Object.keys(prediction)[0];
    const { binType, recyclability } =
        retrieveBinAndRecyclability(classification);

    return (
        <View>
            {binType ? (
                <>
                    <Text style={styles.bottomSheetContentTitle}>
                        {recyclability}{" "}
                        <Text
                            style={{
                                fontWeight: "500",
                                textTransform: "capitalize",
                                color: "#565656",
                                fontSize: 14,
                            }}>
                            ({classification})
                        </Text>
                    </Text>
                    <BinTitle binType={binType} />
                </>
            ) : null}

            <Text style={styles.bottomSheetBinDescription}>
                {getBinDescription(binType)}
            </Text>
        </View>
    );
};

// Function to render bin title with appropriate color style
const BinTitle = ({ binType }) => {
    let colorStyle;
    switch (binType) {
        case BinType.BLUE:
            colorStyle = styles.blueBin;
            break;
        case BinType.GREEN:
            colorStyle = styles.greenBin;
            break;
        case BinType.Orange:
            colorStyle = styles.orangeBin;
            break;
        case BinType.BLACK:
            colorStyle = styles.blackBin;
            break;
        default:
            colorStyle = {}; // Default style if bin type not found
    }

    const binsIconPaths = {
        green: greenBinImagePath,
        blue: blueBinImagePath,
        orange: orangeBinImagePath,
        black: blackBinImagePath,
    };

    return (
        <>
            <View style={{ display: "flex", flexDirection: "row" }}>
                <View style={{ display: "flex", flexDirection: "column" }}>
                    <Text
                        style={{
                            fontSize: 14,
                            color: "#808080",
                            marginTop: 10,
                            fontWeight: "400",
                        }}>
                        Place in:
                    </Text>
                    <Text style={[styles.bottomSheetBinTitle, colorStyle]}>
                        <Text style={{ textTransform: "capitalize" }}>{binType}</Text> bin
                    </Text>
                </View>
                <View
                    style={{
                        width: 50,
                        height: 50,
                        paddingTop: 10,
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                    <Image style={styles.binIconImg} source={binsIconPaths[binType]} />
                </View>
            </View>
            <View
                style={{
                    borderBottomColor: "#D9D9D9",
                    borderBottomWidth: 2,
                    marginVertical: 15,
                }}
            />
        </>
    );
};

// Function to retrieve bin type and recyclability for an item
// return type: { binType: "blue", recyclability: "recyclable" }
const retrieveBinAndRecyclability = (item) => {
    for (const binType in binItems) {
        if (binItems[binType].items.includes(item.toLowerCase())) {
            return { binType, recyclability: binItems[binType].recyclability };
        }
    }
    return { binType: null, recyclability: null }; // Return null if item not classified
};

const getBinDescription = (binType) => {
    switch (binType) {
        case "blue":
            return (
                <>
                    <Text style={{ width: "100%", lineHeight: 25 }}>
                        Blue bin is designated for recyclable waste.{"\n"}Items that are
                        commonly placed in blue bins are:{"\n"}
                    </Text>
                    <View>
                        {[
                            "Paper",
                            "Cardboard",
                            "Glass bottles and jars",
                            "Milk and juice cartons",
                        ].map((item, index) => (
                            <View style={{ marginTop: 10 }} key={index}>
                                <Text key={index}>{`\u2043 ${item}`}</Text>
                            </View>
                        ))}
                    </View>
                </>
            );
        case "green":
            return (
                <>
                    <Text>
                        Green bin is designated for items that can be recycled. {"\n"}
                        {"\n"}This includes:{"\n"}
                    </Text>
                    <View>
                        {[
                            "Metal cans and foil",
                            "Plastic containers with recycling symbols #1 to #7",
                            "Plastic bottles with recycling symbols #1 to #7",
                        ].map((item, index) => (
                            <View style={{ marginTop: 10 }} key={index}>
                                <Text key={index}>{`\u2043 ${item}`}</Text>
                            </View>
                        ))}
                    </View>
                </>
            );
        case "orange":
            return (
                <>
                    <Text>
                        Orange bin is designated for organic waste or compostable
                        materials. {"\n"}
                        {"\n"}This includes:{"\n"}
                    </Text>
                    <View>
                        {["Organics", "Leaves", "Small branches", "Grass clippings"].map(
                            (item, index) => (
                                <View style={{ marginTop: 10 }} key={index}>
                                    <Text key={index}>{`\u2043 ${item}`}</Text>
                                </View>
                            )
                        )}
                    </View>
                </>
            );
        case "black":
            return (
                <>
                    <Text style={{ width: "100%" }}>
                        Black bin is designated for non recyclable waste.{"\n"}
                        {"\n"}Items that are commonly placed in black bins are:{"\n"}
                    </Text>
                    <View>
                        {[
                            "Food scraps",
                            "Diapers, sanitary products",
                            "Broken household items that can't be recycled",
                            "Polystyrene foam",
                        ].map((item, index) => (
                            <View style={{ marginTop: 10 }} key={index}>
                                <Text
                                    key={index}
                                    style={{ textTransform: "capitalize", width: "100%" }}>
                                    {`\u2043 ${item}`}
                                </Text>
                            </View>
                        ))}
                    </View>
                </>
            );
        default:
            return (
                <>
                    <Text className="font-semibold tracking-wide mb-3 text-lg">
                        Bin type not recognized.
                    </Text>
                    <Text>
                        {" "}
                        {"\n"}Please try again or dispose the item to the best of your
                        knowledge.{" "}
                    </Text>
                </>
            );
    }
};

export default PredictionResult;

const styles = StyleSheet.create({
    bottomSheetContentTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#373737",
    },
    bottomSheetBinDescription: {
        fontSize: 15,
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
    binIconImg: {
        display: "flex",
        alignSelf: "flex-end",
        width: "100%",
        height: "100%",
        objectFit: "contain",
    },
});
