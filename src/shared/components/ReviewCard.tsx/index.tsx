import { View, Text, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import React, { useState } from 'react';
import { Icon } from '@components';
import { COLORS, icons } from '@constants';
import styles from './styles';

interface ReviewCardProps {
    avatar: ImageSourcePropType;
    name: string;
    description: string;
    avgRating: number;
    date: string;
    numLikes: number;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
    avatar,
    name,
    description,
    avgRating,
    date,
    numLikes,
}) => {
    const [isLiked, setIsLiked] = useState<boolean>(false);

    return (
        <View style={styles.container}>
            <View style={styles.reviewHeaderContainer}>
                <View style={styles.reviewHeaderLeft}>
                    <Image
                        source={{ uri: avatar }}
                        resizeMode='contain'
                        style={styles.avatar}
                    />

                    <Text style={[styles.name, {
                        color: COLORS.grayscale900
                    }]}>{name}</Text>
                </View>
                <View style={styles.reviewHeaderRight}>
                    <View style={styles.starContainer}>
                        <Icon name="star" type="ionicons" color={COLORS.primary} />
                        <Text style={styles.rating}>{avgRating}</Text>
                    </View>
                    
                </View>
            </View>
            <Text style={[styles.description, {
                color: COLORS.grayscale900
            }]}>{description}</Text>
            {numLikes ? (
            <View style={styles.reviewBottomContainer}>
                <View style={styles.likeContainer}>
                    <TouchableOpacity
                        onPress={() => setIsLiked(!isLiked)}>
                        {
                            isLiked ? (
                                <Image
                                    source={icons.heart3 as ImageSourcePropType}
                                    resizeMode='contain'
                                    style={styles.heartIcon}
                                />
                            ) : (
                                <Image
                                    source={icons.heart2Outline as ImageSourcePropType}
                                    resizeMode='contain'
                                    style={[styles.heartIcon, {
                                        tintColor: COLORS.black
                                    }]}
                                />
                            )
                        }
                    </TouchableOpacity>
                    <Text style={[styles.numLikes, {
                        color: COLORS.grayscale900
                    }]}>{numLikes}</Text>
                </View>
            </View>)
             : ''}
        </View>
    )
}

export default ReviewCard;
