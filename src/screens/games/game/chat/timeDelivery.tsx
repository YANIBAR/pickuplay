//import liraries
import { Icon } from '@components';
import { COLORS } from '@constants';
import moment from 'moment';
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// create a component
const TimeDelivery = (props) => {
    const { sender, item } = props;
    return (
        <View
            style={[styles.mainView, {
                justifyContent: 'flex-end',
            }]}
        >
            <Text style={{
                fontFamily: 'Poppins-Regular', 
                fontSize: 7,
                color: sender ? COLORS.white : COLORS.gray
            }}>
                {moment(item.send_time).format('LLL')}
            </Text>

                <Icon 
                    name = {"checkmark-done"}
                    type = "ionicons"
                />

        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    mainView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2
    }
});

//make this component available to the app
export default TimeDelivery;