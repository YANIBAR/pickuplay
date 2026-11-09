import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, type GestureResponderEvent } from 'react-native';
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
  const [hasBall, setHasBall] = useState(false);
  const [numPlayers, setNumPlayers] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const players = Number(numPlayers) || 1;

  useEffect(() => {
    isStoredTokenExpired().then((expired: boolean) => setIsLogged(!expired));
  }, []);

  const breakdown = useMemo(
    () => buildPriceBreakdownSafe((game?.price ?? 0) * players, promoCode),
    [game?.price, players, promoCode]
  );

  // ── Participant / game status ─────────────────────────────────────────────
  // Participants are nested inside teams now: find me + the team I'm on.
  const { myParticipant, myTeam } = useMemo(() => {
    const myId = String(userData?.id ?? '');
    if (!myId) return { myParticipant: undefined, myTeam: undefined };

    for (const team of game?.teams ?? []) {
      const p = team.participants?.find((p) => String(p.userId) === myId);
      if (p) return { myParticipant: p, myTeam: team };
    }
    return { myParticipant: undefined, myTeam: undefined };
  }, [game?.teams, userData?.id]);

  // Flat list, handy for counts / lists elsewhere
  const allParticipants = useMemo(
    () => (game?.teams ?? []).flatMap((t) => t.participants ?? []),
    [game?.teams]
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
    setSelectedTeamId(null);
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
    if (breakdown.total > 0 && !method) return;
    setIsJoining(true);
    try {
      // 1. Join first: backend creates the participant + PaymentIntent
      const response = await authenticatedApi.post(`games/${game.id}/join`, {
        guestNumber: players - 1,
        teamId: selectedTeamId,
        hasBall: hasBall,
      });

      if (response.status === 200) {
        // 2. Paid game: pay with the chosen method
        /*const clientSecret = response?.result?.data?.clientSecret;
        if (clientSecret) {
          const result = await PaymentService.payWithStripe(clientSecret);
          if (!result.success) return;
        }*/

        closeJoinModal();
        setSuccessVisible(true);
        await onRefresh?.();
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not join the game.');
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
    if (isJoining || !game || !myParticipant) return;

    setIsJoining(true);
    try {
      const response = await authPaymentApi.post('create-intent', {
        ItemType: 'game',
        ItemId: String(myParticipant.id),
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
    myParticipant,
    myTeam,
    allParticipants,
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
    selectedTeamId,
    setSelectedTeamId,
    hasBall,
    setHasBall
  };
}

export type GameJoinState = ReturnType<typeof useGameJoin>; 