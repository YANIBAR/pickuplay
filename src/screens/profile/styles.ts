import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
    area: {
            
            flex: 1,
            backgroundColor: COLORS.white,
            minHeight: SIZES.height
        },
        container: {
            flex: 1,
            backgroundColor: COLORS.white,
        },
        headerContainer: {
            paddingHorizontal:16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
      },
      headerLeft: {
        flexDirection: "row",
        alignItems: "center"
      },
      logo: {
        height: 32,
        width: 32
      },
      headerTitle: {
        fontSize: 22,
        fontFamily: "bold",
        color: COLORS.grayscale900,
        marginLeft: 12
      },
      headerIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.grayscale900
      },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
        bottomContainer: {
            width: "100%",
            paddingHorizontal: 16,
            paddingVertical: 20,
            alignItems: "center",
        },
        btn: {
            width: SIZES.width - 32,
            marginTop: 12
        },
        locationMapContainer: {
            height: 226,
            width: "100%",
            borderRadius: 12,
            marginVertical: 16
        },
        mapContainer: {
            ...StyleSheet.absoluteFillObject,
            flex: 1,
            borderRadius: 12,
            backgroundColor: COLORS.dark2
        },
        viewMapContainer: {
            height: 50,
            backgroundColor: COLORS.gray,
            alignItems: "center",
            justifyContent: "center",
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25
        },
        bubble: {
            flexDirection: 'column',
            alignSelf: 'flex-start',
            backgroundColor: '#fff',
            borderRadius: 6,
            borderColor: '#ccc',
            borderWidth: 0.5,
            padding: 15,
            width: 'auto',
        },
        // Arrow below the bubble
        arrow: {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderTopColor: '#fff',
            borderWidth: 16,
            alignSelf: 'center',
            marginTop: -32,
        },
        arrowBorder: {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderTopColor: '#007a87',
            borderWidth: 16,
            alignSelf: 'center',
            marginTop: -0.5,
        },
        bottomTopContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            marginTop: 22,
        },
        bottomTopTitle: {
            fontSize: 18,
            fontFamily: "bold",
            color: COLORS.black
        },
        bottomTopSubtitle: {
            fontSize: 16,
            color: COLORS.grayscale900,
            fontFamily: "regular"
        },
        separateLine: {
            height: .4,
            width: SIZES.width - 32,
            backgroundColor: COLORS.grayscale300,
            marginVertical: 12
        },
        addressItemContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            marginBottom: 12
        },
        addressItemLeftContainer: {
            flexDirection: "row",
            alignItems: "center"
        },
        driverInfoContainer: {
            width: "100%",
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center"
        },
        driverLeftInfo: {
            flexDirection: "row",
            alignItems: "center"
        },
        driverImage: {
            width: 52,
            height: 52,
            borderRadius: 999,
            marginRight: 12
        },
        driverName: {
            fontSize: 18,
            fontFamily: "bold",
            color: COLORS.grayscale900,
            marginBottom: 4
        },
        driverCar: {
            fontSize: 14,
            color: COLORS.grayscale700,
            fontFamily: "regular",
            marginTop: 6
        },
        driverRightContainer: {
            flexDirection: "row",
            alignItems: "center"
        },
        driverRightReview: {
            flexDirection: "row",
            alignItems: "center"
        },
        starIcon: {
            height: 18,
            width: 18,
            tintColor: COLORS.primary,
            marginRight: 6
        },
        starNum: {
            fontSize: 16,
            color: COLORS.grayscale900,
            fontFamily: "regular"
        },
        taxiID: {
            fontSize: 14,
            color: COLORS.grayscale900,
            fontFamily: "medium",
            marginTop: 6
        },
        actionContainer: {
            flexDirection: "row",
            marginTop: 22
        },
        actionBtn: {
            width: 64,
            height: 64,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.primary,
            marginHorizontal: 12
        },
        profileContainer: {
        alignItems: "center",
      },
  avatarContainer: {
    marginVertical: 12,
    alignItems: "center",
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  avatar: {
    height: 160,
    width: 160,
    borderRadius: 80,
  },
  pickImage: {
    height: 36,
    width: 36,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
      picContainer: {
        width: 20,
        height: 20,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        position: "absolute",
        right: 0,
        bottom: 12
      },
      title: {
        fontSize: 18,
        fontFamily: "bold",
        color: COLORS.grayscale900,
      },
      subtitle: {
        fontSize: 16,
        color: COLORS.grayscale900,
        fontFamily: "medium",
        marginTop: 8
      },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
        marginTop: 8
  },
  primaryButtonText: {
    color: '#1FAC9B',
    fontSize: 16,
    fontWeight: '600',
  },
    actionIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.black
    },
    locationItemContainer: {
        width: "100%",
        marginVertical: 12,
        justifyContent: "space-between"
    },
    locationIcon1: {
        height: 52,
        width: 52,
        borderRadius: 999,
        marginRight: 12,
        backgroundColor: COLORS.transparentPrimary,
        alignItems: "center",
        justifyContent: "center",
    },
    locationIcon2: {
        height: 36,
        width: 36,
        borderRadius: 999,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    locationIcon3: {
        width: 16,
        height: 16,
        tintColor: COLORS.white
    },
    baseLocationName: {
        fontSize: 17,
        color: COLORS.grayscale900,
        fontFamily: "bold",
    },
    baseLocationAddress: {
        fontSize: 14,
        color: COLORS.grayscale800,
        fontFamily: "regular",
        marginTop: 8
    },
    arrowIconContainer: {
        width: "100%",
        alignItems: "center",
        marginTop: 12
    },
    arrowIcon: {
        height: 18,
        width: 18,
        tintColor: COLORS.black
    },
    locationDistance: {
        fontSize: 14,
        color: COLORS.grayscale900,
        fontFamily: "medium",
    },
    locationItemRow: {
        flexDirection: "row",
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: "bold",
        color: COLORS.black,
        textAlign: "center",
        marginVertical: 12
    },
    modalSubtitle: {
        fontSize: 16,
        fontFamily: "regular",
        color: COLORS.black,
        textAlign: "center",
        marginVertical: 12
    },
    modalContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.56)"
    },
    modalSubContainer: {
        height: 520,
        width: SIZES.width * 0.9,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        padding: 16
    },
    modalIllustration: {
        height: 180,
        width: 180,
        marginVertical: 22
    },
    successBtn: {
        width: "100%",
        marginTop: 12,
        borderRadius: 32
    },
    receiptBtn: {
        width: "100%",
        marginTop: 12,
        borderRadius: 32,
        backgroundColor: COLORS.transparentPrimary,
        borderColor: COLORS.transparentPrimary
    },
    editPencilIcon: {
        width: 42,
        height: 42,
        tintColor: COLORS.white,
        zIndex: 99999,
        position: "absolute",
        top: 58,
        left: 58,
    },
    backgroundIllustration: {
        height: 150,
        width: 150,
        marginVertical: 22,
        alignItems: "center",
        justifyContent: "center",
        zIndex: -999
    },
    happyMood: {
        fontSize: 154
    },
    orderDetailsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 12,
        width: "100%"
    },
    orderViewContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    orderDetailsTitle: {
        fontSize: 18,
        fontFamily: "bold",
        color: COLORS.black,
        marginBottom: 12
    },
    orderDetailsSubtitle: {
        fontSize: 14,
        fontFamily: "medium",
        color: COLORS.grayscale700
    },
    deliveryTime: {
        fontSize: 12,
        fontFamily: "medium",
        color: COLORS.grayscale700
    },
    orderView: {
        marginLeft: 12
    },
    chatIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.primary,
        marginRight: 12
    },
    phoneIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.error,
        marginLeft: 12
    },
    summaryViewContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        width: SIZES.width - 32,
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderRadius: 24,
        backgroundColor: COLORS.white,
        borderColor: "rgba(0,0,0,0.06)",
        borderWidth: 1,
        marginVertical: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
    },
    viewItemContainer: {
        alignItems: "center",
        flex: 1,
    },
    // Vertical divider between items (apply to middle item or use a separator View)
    viewDivider: {
        width: 1,
        height: 52,
        backgroundColor: "rgba(0,0,0,0.08)",
    },
    viewIconContainer: {
        height: 48,
        width: 48,
        borderRadius: 56,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        backgroundColor: COLORS.transparentPrimary, // 9% opacity tint
    },
    viewIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.primary,
    },
    viewTitle: {
        fontSize: 12,
        fontFamily: "bold",
        color: COLORS.grayscale900,
        marginBottom: 2,
        letterSpacing: -0.3,
    },
    viewSubtitle: {
        fontSize: 10,
        fontFamily: "medium",
        color: COLORS.grayscale500,
        letterSpacing: 0.4,
        textTransform: "uppercase",
    },
  /* ── Section Title ── */
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.secondary,
    marginBottom: 12,
  },
  /* ── Empty State ── */
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconText: {
    fontSize: 22,
  },
  emptyText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'regular',
    color: '#444',
    lineHeight: 20,
  },
  emptyBold: {
    fontFamily: 'bold',
    color: '#1A1A2E',
  },

  /* ── Game Cards ── */
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    gap: 12,
  },
  gameIconBg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.transparentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameIconText: {
    fontSize: 22,
  },
  gameInfo: {
    flex: 1,
    gap: 3,
  },
  gameName: {
    fontSize: 15,
    fontFamily: 'bold',
    color: '#1A1A2E',
  },
  gameSub: {
    fontSize: 10,
    fontFamily: 'regular',
    color: '#888',
  },
  gameRight: {
    alignItems: 'center',
  },
  gamePlayers: {
    fontSize: 15,
    fontFamily: 'bold',
    color: COLORS.primary,
  },
  gamePlayersLabel: {
    fontSize: 11,
    fontFamily: 'regular',
    color: '#999',
  },
  gameCardDivider: {
    width: 1,
    height: 46,
    backgroundColor: COLORS.transparentPrimary, // or '#E5E5E5' for neutral
    }
});
