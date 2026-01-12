import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import {
  registerPending,
  registerFulfilled,
  registerRejected,
} from '../slices/auth';
import api from '@utils/api/auth';
import { registerFormData } from '@types';

function* register({ payload }: PayloadAction<registerFormData>) {
  try {
    const { data }: AxiosResponse<any> = yield call(api.register, payload);
    console.log('API response:', JSON.stringify(data, null, 2));
    yield put(registerFulfilled(data));
  } catch (e: unknown) {
    if (e instanceof Error) {
      yield put(registerRejected(e.message));
    }
  }
}

export default function* authSaga() {
  yield takeLatest(registerPending.type, register);
}
