import React from 'react';
import { View, Text } from 'react-native';
import { FONTS, COLORS, SIZES } from '@constants';

interface PriceTagProps {
    game: any;
    unit?: string;
}

const PriceTag: React.FC<PriceTagProps> = ({ game, unit = '/ player' }) => {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.originalPrice]}>
                {game.price ? "$" + game.price.toFixed(2) + unit : 'Free'}
            </Text>
            {game.discount && (
            <Text style={styles.originalPrice}>${(game.price - game.discount).toFixed(2)}</Text> 
            )}
        </View>
    );
};

const styles = {
    originalPrice: {
        //textDecorationLine: 'line-through',
        color: COLORS.black,
        fontSize: SIZES.h4,
        fontWeight: '600',
    },
};

export default PriceTag;
