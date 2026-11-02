import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { authenticatedApi } from '@services/api';
import { authPaymentApi } from '@services/paymentApi';
import PaymentService, {
  buildPriceBreakdownSafe,
  type PaymentMethod,
} from '@services/payment';
import { useUserData } from '@services/useUserData';
import { isStoredTokenExpired } from '@utils/api/auth';
import type { Game } from './types';

const stop = (e?: GestureResponderEvent) => e?.stopPropagation?.();

/**
 * Everything GameCard and the game details screen both need to join,
 * unjoin and pay for a game: modal state, price breakdown, participant
 * status and the API handlers.
 *
 * `onRefresh` is called after any action that changes the game
 * (card: parent list refresh, details screen: fetchGame).
 */
export function useGameJoin(
  game: Partial<Game> | undefined,
  onRefresh?: () => void | Promise<void>
) {
  const { userData } = useUserData();

  const [isLogged, setIsLogged] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [unjoinModalVisible, setUnjoinModalVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [numPlayers, setNumPlayers] = useState(1);
  const [promoCode, setPromoCode] = useState('');

  const players = Number(numPlayers) || 1;

  // logged in = stored token is NOT expired
  useEffect(() => {
    isStoredTokenExpired().then((expired: boolean) => setIsLogged(!expired));
  }, []);

  // Derived from state, so it stays correct when the player count or promo changes.
  const breakdown = useMemo(
    () => buildPriceBreakdownSafe((game?.price ?? 0) * players, promoCode),
    [game?.price, players, promoCode]
  );

  // ── Participant / game status ─────────────────────────────────────────────
  const myParticipant = game?.participants?.find(
    (p) => String(p.userId) === String(userData?.id)
  );
  const myStatus = myParticipant?.status?.toUpperCase();

  const isParticipant = !!myParticipant;
  const isPendingPayment = myStatus === 'PENDING_APPROVAL';
  const isJoined = myStatus === 'JOINED';
  const isFull = game?.availableSpots === 0;
  const isCanceled = game?.status === 'CANCELED';
  const canJoin = !isParticipant && !isFull && !isCanceled;

  // ── Modal controls ────────────────────────────────────────────────────────
  const openJoin = (e?: GestureResponderEvent) => {
    stop(e);
    setJoinModalVisible(true);
  };

  const closeJoinModal = useCallback(() => {
    setJoinModalVisible(false);
    setNumPlayers(1);
    setPromoCode('');
  }, []);

  const openUnjoin = (e?: GestureResponderEvent) => {
    stop(e);
    setUnjoinModalVisible(true);
  };
  const closeUnjoin = () => setUnjoinModalVisible(false);
  const closeSuccess = () => setSuccessVisible(false);

  // ── API actions ───────────────────────────────────────────────────────────
  const confirmJoin = async (method?: PaymentMethod) => {
    if (isJoining || !game) return;
    // Paid game requires a chosen method
    if (breakdown.total > 0 && !method) return;

    setIsJoining(true);
    try {
      // 1. Join first: backend creates the participant + PaymentIntent
      const response = await authenticatedApi.post(`games/${game.id}/join`, null, {
        params: { guestNumber: players - 1 },
      });
      console.log('Join response:', response);
      if (response.status === 200) {
        // 2. Paid game: pay with the chosen method
        const clientSecret = response?.result?.data?.clientSecret;
        if (clientSecret) {
          const result = await PaymentService.payWithStripe(clientSecret);
          if (!result.success) return;
        }

        closeJoinModal();
        setSuccessVisible(true);
        await onRefresh?.();
      }
     setJoinModalVisible(false);
     onRefresh?.();
    } catch (e) {
      console.error('Join failed:', e);
    } finally {
      setIsJoining(false);
    }
  };

  const confirmUnjoin = async () => {
    if (isJoining || !game) return;

    setIsJoining(true);
    try {
      const response = await authenticatedApi.post(`games/${game.id}/unjoin`);
      if (response.status === 200) {
        setUnjoinModalVisible(false);
        await onRefresh?.();
      }
    } catch (e) {
      console.error('Error unjoining game:', e);
    } finally {
      setIsJoining(false);
    }
  };

  // Pay for an existing pending participant
  const pay = async (e?: GestureResponderEvent) => {
    stop(e);
    if (isJoining || !game) return;

    setIsJoining(true);
    try {
      const response = await authPaymentApi.post('create-intent', {
        ItemType: 'game',
        ItemId: String(myParticipant?.id),
      });
      const clientSecret = response?.result?.data;

      if (response.status === 200 && clientSecret) {
        const result = await PaymentService.payWithStripe(clientSecret);
        if (result.success) await onRefresh?.();
      }
    } catch (err) {
      console.error('Payment failed:', err);
    } finally {
      setIsJoining(false);
    }
  };

  return {
    // user / auth
    userData,
    isLogged,
    // status
    isParticipant,
    isJoined,
    isPendingPayment,
    isFull,
    isCanceled,
    canJoin,
    isJoining,
    // form + price
    numPlayers,
    setNumPlayers,
    players,
    promoCode,
    setPromoCode,
    breakdown,
    // modal state + controls
    joinModalVisible,
    unjoinModalVisible,
    successVisible,
    openJoin,
    closeJoinModal,
    openUnjoin,
    closeUnjoin,
    closeSuccess,
    // actions
    confirmJoin,
    confirmUnjoin,
    pay,
  };
}

export type GameJoinState = ReturnType<typeof useGameJoin>;