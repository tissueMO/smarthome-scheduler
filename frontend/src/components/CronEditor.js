import {
  CButton,
  CCol,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
} from '@coreui/react';
import { useEffect, useState } from 'react';

export default function CronEditor({ visible, cronExpression = '* * * * *', onClose, onSubmit }) {
  const [minutes, setMinutes] = useState('');
  const [hours, setHours] = useState('');
  const [days, setDays] = useState('');
  const [months, setMonths] = useState('');
  const [dayOfWeeks, setDayOfWeeks] = useState('');
  const [noScheduled, setNoScheduled] = useState(false);

  useEffect(() => {
    const values = cronExpression.split(' ');
    setMinutes(values?.[0] ?? '');
    setHours(values?.[1] ?? '');
    setDays(values?.[2] ?? '');
    setMonths(values?.[3] ?? '');
    setDayOfWeeks(values?.[4] ?? '');
    setNoScheduled(cronExpression === '');
  }, [cronExpression]);

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader onClose={onClose}>
        <CModalTitle>cron 式エディター</CModalTitle>
      </CModalHeader>
      <CModalBody className='mx-4'>
        <CRow className='mb-3'>
          <CFormLabel className='col-2 col-form-label'>分</CFormLabel>
          <CCol xs={10}>
            <CFormInput
              value={minutes}
              type='text'
              placeholder='0-60'
              onInput={(e) => setMinutes(e.target.value)}
              disabled={noScheduled}
            />
          </CCol>
        </CRow>
        <CRow className='mb-3'>
          <CFormLabel className='col-2 col-form-label'>時</CFormLabel>
          <CCol xs={10}>
            <CFormInput
              value={hours}
              type='text'
              placeholder='0-23'
              onInput={(e) => setHours(e.target.value)}
              disabled={noScheduled}
            />
          </CCol>
        </CRow>
        <CRow className='mb-3'>
          <CFormLabel className='col-2 col-form-label'>日</CFormLabel>
          <CCol xs={10}>
            <CFormInput
              value={days}
              type='text'
              placeholder='1-31'
              onInput={(e) => setDays(e.target.value)}
              disabled={noScheduled}
            />
          </CCol>
        </CRow>
        <CRow className='mb-3'>
          <CFormLabel className='col-2 col-form-label'>月</CFormLabel>
          <CCol xs={10}>
            <CFormInput
              value={months}
              type='text'
              placeholder='0-11'
              onInput={(e) => setMonths(e.target.value)}
              disabled={noScheduled}
            />
          </CCol>
        </CRow>
        <CRow className='mb-3'>
          <CFormLabel className='col-2 col-form-label'>曜日</CFormLabel>
          <CCol xs={10}>
            <CFormInput
              value={dayOfWeeks}
              type='text'
              placeholder='0-6 (日-土), $=土日祝, #=土日祝以外, @=祝日以外'
              onInput={(e) => setDayOfWeeks(e.target.value)}
              disabled={noScheduled}
            />
          </CCol>
        </CRow>
        <CRow className='px-2 mt-4 mb-1'>
          <CFormCheck
            id='cron-editor-no-scheduled'
            label='スケジュール実行しない'
            defaultChecked={noScheduled}
            onInput={(e) => setNoScheduled(e.target.checked)}
          />
        </CRow>
      </CModalBody>
      <CModalFooter>
        <CButton color='secondary' variant='outline' className='w-25' onClick={onClose}>
          キャンセル
        </CButton>
        <CButton
          color='primary'
          className='w-25'
          onClick={() => {
            onSubmit(noScheduled ? '' : [minutes, hours, days, months, dayOfWeeks].join(' ').trim());
            onClose();
          }}
        >
          OK
        </CButton>
      </CModalFooter>
    </CModal>
  );
}
