import {
  CBreadcrumb,
  CBreadcrumbItem,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CHeader,
  CHeaderDivider,
  CInputGroup,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CTabContent,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableFoot,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTabPane,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
} from '@coreui/react';
import * as fasIcon from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function TopPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [submitToasts, addSubmitToast] = useState(0);
  const [hasError, setHasError] = useState(null);
  const [cronEditorTarget, setCronEditorTarget] = useState(null);
  const [cronEditorMinutes, setCronEditorMinutes] = useState('');
  const [cronEditorHours, setCronEditorHours] = useState('');
  const [cronEditorDays, setCronEditorDays] = useState('');
  const [cronEditorMonths, setCronEditorMonths] = useState('');
  const [cronEditorDayOfWeeks, setCronEditorDayOfWeeks] = useState('');
  const tabCaptions = ['スケジュール', '予約'];

  // スケジュール取得
  useEffect(() => {
    (async () => {
      const { data, status } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/schedules`);
      if (status === 200) {
        setJobs(data.jobs);
        setReservations(
          data.reservations.map((reservation) => ({
            type: reservation.type,
            start: dayjs(reservation.options.start).format('YYYY-MM-DDTHH:mm'),
            end: dayjs(reservation.options.end).format('YYYY-MM-DDTHH:mm'),
            target: reservation.options.target,
          })),
        );
      }
    })();
  }, []);

  // スケジュール更新
  const updateSchedules = async () => {
    try {
      const { data: data } = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/schedules`,
        {
          jobs: jobs.map((j) => ({
            title: j.title,
            cronExpression: j.cronExpression,
            url: j.url,
          })),
          reservations: reservations.map((r) => ({
            type: r.type,
            options: {
              start: dayjs(r.start).format('YYYY-MM-DDTHH:mm:00'),
              end: dayjs(r.end).format('YYYY-MM-DDTHH:mm:00'),
              target: r.target,
            },
          })),
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      setJobs(data.jobs);
      setReservations(
        data.reservations.map((reservation) => ({
          type: reservation.type,
          start: dayjs(reservation.options.start).format('YYYY-MM-DDTHH:mm'),
          end: dayjs(reservation.options.end).format('YYYY-MM-DDTHH:mm'),
          target: reservation.options.target,
        })),
      );

      setHasError(false);
    } catch (e) {
      console.error(e);
      setHasError(true);
    }
  };

  // 操作結果をトーストで表示
  useEffect(() => {
    if (hasError !== null) {
      addSubmitToast(
        <CToast autohide color={hasError ? 'danger' : 'success'} animation>
          <CToastHeader closeButton>
            <strong className='me-auto'>操作結果</strong>
          </CToastHeader>
          <CToastBody>{hasError ? 'スケジュールの更新に失敗しました。' : 'スケジュールを更新しました。'}</CToastBody>
        </CToast>,
      );
      setHasError(null);
    }
  }, [hasError]);

  // cron式エディターを開いたときに初期値を埋める
  useEffect(() => {
    if (cronEditorTarget !== null) {
      const values = jobs[cronEditorTarget].cronExpression.split(' ');
      setCronEditorMinutes(values?.[0] ?? '');
      setCronEditorHours(values?.[1] ?? '');
      setCronEditorDays(values?.[2] ?? '');
      setCronEditorMonths(values?.[3] ?? '');
      setCronEditorDayOfWeeks(values?.[4] ?? '');
    }
  }, [cronEditorTarget, jobs]);

  return (
    <div className='app-container'>
      <CHeader className='app-header navbar header-sticky'>
        <CContainer fluid>
          <Link href='/'>
            <a className='navbar-brand mx-lg-3 fw-bold'>我が家のスケジューラー</a>
          </Link>
        </CContainer>
        <CHeaderDivider />
        <CContainer fluid>
          <CBreadcrumb className='m-0'>
            <CBreadcrumbItem active>{tabCaptions[activeTab]}</CBreadcrumbItem>
          </CBreadcrumb>
        </CContainer>
      </CHeader>

      <div className='app-body'>
        <main className='main bg-light py-4'>
          <CContainer fluid className='pb-5'>
            <CRow>
              <CCard className='col-12 col-sm-11 mx-auto'>
                <CCardBody>
                  <CRow>
                    <CCol xs={12}>
                      <CForm>
                        <CNav variant='pills' layout='justified'>
                          {tabCaptions.map((tab, i) => (
                            <CNavItem key={i}>
                              <CNavLink
                                href='javascript:void(0)'
                                active={activeTab === i}
                                onClick={() => setActiveTab(i)}
                              >
                                {tab}
                              </CNavLink>
                            </CNavItem>
                          ))}
                        </CNav>
                        <CTabContent className='p-3 pt-5'>
                          <CTabPane visible={activeTab === 0}>
                            <CTable>
                              <CTableHead>
                                <CTableRow>
                                  <CTableHeaderCell scope='col' className='p-2'>
                                    タイトル
                                  </CTableHeaderCell>
                                  <CTableHeaderCell scope='col' className='p-2'>
                                    cron 式
                                  </CTableHeaderCell>
                                  <CTableHeaderCell scope='col' className='p-2'>
                                    アクション URL
                                  </CTableHeaderCell>
                                  <CTableHeaderCell scope='col' className='p-2'>
                                    {/* 操作ボタン列 */}
                                  </CTableHeaderCell>
                                </CTableRow>
                              </CTableHead>
                              <CTableBody>
                                {jobs.map((job, i) => (
                                  <CTableRow key={i}>
                                    <CTableDataCell>
                                      <CFormInput
                                        type='text'
                                        value={job.title}
                                        onChange={(e) =>
                                          setJobs(
                                            jobs.map((job, j) => (i !== j ? job : { ...job, title: e.target.value })),
                                          )
                                        }
                                      />
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      <CInputGroup>
                                        <CFormInput
                                          type='text'
                                          value={job.cronExpression}
                                          onChange={(e) =>
                                            setJobs(
                                              jobs.map((job, j) =>
                                                i !== j ? job : { ...job, cronExpression: e.target.value },
                                              ),
                                            )
                                          }
                                        />
                                        <CButton
                                          type='button'
                                          color='secondary'
                                          variant='outline'
                                          onClick={() => {
                                            setCronEditorTarget(i);
                                          }}
                                        >
                                          ...
                                        </CButton>
                                      </CInputGroup>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      <CFormInput
                                        type='url'
                                        value={job.url}
                                        onChange={(e) =>
                                          setJobs(
                                            jobs.map((job, j) => (i !== j ? job : { ...job, url: e.target.value })),
                                          )
                                        }
                                      />
                                    </CTableDataCell>
                                    <CTableDataCell className='text-nowrap'>
                                      <CButton
                                        variant='outline'
                                        color='danger'
                                        shape='rounded-pill'
                                        onClick={() => setJobs(jobs.filter((_, j) => i !== j))}
                                      >
                                        <FontAwesomeIcon icon={fasIcon.faTrashAlt} />
                                      </CButton>
                                      <CButton
                                        className='ms-2'
                                        variant='outline'
                                        color='dark'
                                        shape='rounded-pill'
                                        onClick={() => {
                                          jobs.splice(i - 1, 2, jobs[i], jobs[i - 1]);
                                          setJobs([...jobs]);
                                        }}
                                        disabled={i === 0}
                                      >
                                        <FontAwesomeIcon icon={fasIcon.faArrowUp} />
                                      </CButton>
                                      <CButton
                                        variant='outline'
                                        color='dark'
                                        shape='rounded-pill'
                                        onClick={() => {
                                          jobs.splice(i, 2, jobs[i + 1], jobs[i]);
                                          setJobs([...jobs]);
                                        }}
                                        disabled={i === jobs.length - 1}
                                      >
                                        <FontAwesomeIcon icon={fasIcon.faArrowDown} />
                                      </CButton>
                                    </CTableDataCell>
                                  </CTableRow>
                                ))}
                              </CTableBody>
                              <CTableFoot>
                                <CTableRow>
                                  <CTableDataCell className='py-3 border-0'>
                                    <CButton
                                      className='px-3'
                                      variant='outline'
                                      color='primary'
                                      shape='rounded-pill'
                                      onClick={() =>
                                        setJobs([
                                          ...jobs,
                                          {
                                            title: '',
                                            cronExpression: '* * * * *',
                                            url: '',
                                          },
                                        ])
                                      }
                                    >
                                      <FontAwesomeIcon icon={fasIcon.faPlus} />
                                    </CButton>
                                  </CTableDataCell>
                                </CTableRow>
                              </CTableFoot>
                            </CTable>
                          </CTabPane>
                          <CTabPane visible={activeTab === 1}>
                            <CTable>
                              <CTableHead>
                                <CTableRow>
                                  <CTableHeaderCell scope='col' className='p-2'>
                                    種別
                                  </CTableHeaderCell>
                                  <CTableHeaderCell scope='col' className='p-2'>
                                    開始
                                  </CTableHeaderCell>
                                  <CTableHeaderCell scope='col' className='p-2'>
                                    終了
                                  </CTableHeaderCell>
                                  <CTableHeaderCell scope='col' className='p-2 w-25'>
                                    対象
                                  </CTableHeaderCell>
                                  <CTableHeaderCell scope='col' className='p-2'>
                                    {/* 操作ボタン列 */}
                                  </CTableHeaderCell>
                                </CTableRow>
                              </CTableHead>
                              <CTableBody>
                                {reservations.map((reservation, i) => (
                                  <CTableRow key={i}>
                                    <CTableDataCell>
                                      <CFormSelect
                                        options={[
                                          { label: 'サイレント', value: 'silent' },
                                          { label: 'スポット', value: 'spot' },
                                        ]}
                                        value={reservation.type}
                                        onChange={(e) =>
                                          setReservations(
                                            reservations.map((reservation, j) =>
                                              i !== j ? reservation : { ...reservation, type: e.target.value },
                                            ),
                                          )
                                        }
                                      />
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      <CFormInput
                                        type='datetime-local'
                                        value={reservation.start}
                                        onChange={(e) =>
                                          setReservations(
                                            reservations.map((reservation, j) =>
                                              i !== j ? reservation : { ...reservation, start: e.target.value },
                                            ),
                                          )
                                        }
                                      />
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      <CFormInput
                                        type='datetime-local'
                                        value={reservation.end}
                                        onChange={(e) =>
                                          setReservations(
                                            reservations.map((reservation, j) =>
                                              i !== j ? reservation : { ...reservation, end: e.target.value },
                                            ),
                                          )
                                        }
                                      />
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      <CFormSelect
                                        options={[
                                          '*',
                                          ...jobs.map((job) => job.title).filter((t) => t.trim().length > 0),
                                        ]}
                                        value={reservation.target}
                                        onChange={(e) =>
                                          setReservations(
                                            reservations.map((reservation, j) =>
                                              i !== j ? reservation : { ...reservation, target: e.target.value },
                                            ),
                                          )
                                        }
                                      />
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      <CButton
                                        variant='outline'
                                        color='danger'
                                        shape='rounded-pill'
                                        onClick={() => setReservations(reservations.filter((_, j) => i !== j))}
                                      >
                                        <FontAwesomeIcon icon={fasIcon.faTrashAlt} />
                                      </CButton>
                                    </CTableDataCell>
                                  </CTableRow>
                                ))}
                              </CTableBody>
                              <CTableFoot>
                                <CTableRow>
                                  <CTableDataCell className='py-3 border-0'>
                                    <CButton
                                      className='px-3'
                                      variant='outline'
                                      color='primary'
                                      shape='rounded-pill'
                                      onClick={() =>
                                        setReservations([
                                          ...reservations,
                                          {
                                            type: 'silent',
                                            start: dayjs().format('YYYY-MM-DDTHH:00'),
                                            end: dayjs().format('YYYY-MM-DDTHH:00'),
                                            target: '*',
                                          },
                                        ])
                                      }
                                    >
                                      <FontAwesomeIcon icon={fasIcon.faPlus} />
                                    </CButton>
                                  </CTableDataCell>
                                </CTableRow>
                              </CTableFoot>
                            </CTable>
                          </CTabPane>
                        </CTabContent>
                      </CForm>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            </CRow>
            <CRow>
              <CCol xs={12} sm={11} className='mx-auto px-0 py-4 text-end'>
                <CButton className='px-5 py-2' color='primary' shape='rounded-0' onClick={() => updateSchedules()}>
                  更新
                </CButton>
                <CToaster push={submitToasts} placement='top-end' />
              </CCol>
            </CRow>
          </CContainer>

          <CModal visible={cronEditorTarget !== null} onClose={() => setCronEditorTarget(null)}>
            <CModalHeader onClose={() => setCronEditorTarget(null)}>
              <CModalTitle>cron 式エディター</CModalTitle>
            </CModalHeader>
            <CModalBody className='mx-4'>
              <CRow className='mb-3'>
                <CFormLabel className='col-2 col-form-label'>分</CFormLabel>
                <CCol xs={10}>
                  <CFormInput
                    value={cronEditorMinutes}
                    type='text'
                    placeholder='0-60'
                    onInput={(e) => setCronEditorMinutes(e.target.value)}
                  />
                </CCol>
              </CRow>
              <CRow className='mb-3'>
                <CFormLabel className='col-2 col-form-label'>時</CFormLabel>
                <CCol xs={10}>
                  <CFormInput
                    value={cronEditorHours}
                    type='text'
                    placeholder='0-23'
                    onInput={(e) => setCronEditorHours(e.target.value)}
                  />
                </CCol>
              </CRow>
              <CRow className='mb-3'>
                <CFormLabel className='col-2 col-form-label'>日</CFormLabel>
                <CCol xs={10}>
                  <CFormInput
                    value={cronEditorDays}
                    type='text'
                    placeholder='1-31'
                    onInput={(e) => setCronEditorDays(e.target.value)}
                  />
                </CCol>
              </CRow>
              <CRow className='mb-3'>
                <CFormLabel className='col-2 col-form-label'>月</CFormLabel>
                <CCol xs={10}>
                  <CFormInput
                    value={cronEditorMonths}
                    type='text'
                    placeholder='0-11'
                    onInput={(e) => setCronEditorMonths(e.target.value)}
                  />
                </CCol>
              </CRow>
              <CRow className='mb-3'>
                <CFormLabel className='col-2 col-form-label'>曜日</CFormLabel>
                <CCol xs={10}>
                  <CFormInput
                    value={cronEditorDayOfWeeks}
                    type='text'
                    placeholder='0-6 (日曜日-土曜日), $=土日祝, #=土日祝以外'
                    onInput={(e) => setCronEditorDayOfWeeks(e.target.value)}
                  />
                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter>
              <CButton color='secondary' variant='outline' className='w-25' onClick={() => setCronEditorTarget(null)}>
                キャンセル
              </CButton>
              <CButton
                color='primary'
                className='w-25'
                onClick={() => {
                  const cronExpression = [
                    cronEditorMinutes,
                    cronEditorHours,
                    cronEditorDays,
                    cronEditorMonths,
                    cronEditorDayOfWeeks,
                  ].join(' ');
                  setJobs(jobs.map((job, i) => (cronEditorTarget !== i ? job : { ...job, cronExpression })));
                  setCronEditorTarget(null);
                }}
              >
                OK
              </CButton>
            </CModalFooter>
          </CModal>
        </main>
      </div>

      <CFooter position='fixed'>
        <div>
          <span>Copyright © 2022 tissueMO</span>
        </div>
        <div className='ml-auto'>
          Powered by &nbsp;
          <a href='https://coreui.io' target='_blank' rel='noreferrer'>
            CoreUI
          </a>
        </div>
      </CFooter>
    </div>
  );
}
