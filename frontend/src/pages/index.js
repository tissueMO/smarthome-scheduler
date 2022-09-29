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
  CHeader,
  CHeaderDivider,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CTabContent,
  CTabPane,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
} from '@coreui/react';
import axios from 'axios';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ConfigTable from '../components/ConfigTable';
import CronEditor from '../components/CronEditor';

export default function TopPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [submitToasts, addSubmitToast] = useState(0);
  const [hasError, setHasError] = useState(null);
  const [cronEditorTarget, setCronEditorTarget] = useState(null);
  const tabCaptions = ['スケジュール', '予約'];
  const jobsSchema = [
    {
      caption: 'タイトル',
      key: 'title',
      className: 'w-25',
    },
    {
      caption: 'cron 式',
      key: 'cronExpression',
      hasButton: true,
    },
    {
      caption: 'アクション URL',
      key: 'url',
      type: 'url',
      className: 'w-50',
    },
  ];
  const reservationsSchema = [
    {
      caption: '種別',
      key: 'type',
      type: 'select',
      options: () => [
        { label: 'サイレント', value: 'silent' },
        { label: 'スポット', value: 'spot' },
      ],
    },
    {
      caption: '開始',
      key: 'start',
      type: 'datetime-local',
    },
    {
      caption: '終了',
      key: 'end',
      type: 'datetime-local',
    },
    {
      caption: '対象',
      key: 'target',
      type: 'select',
      options: () => ['*', ...jobs.map((job) => job.title).filter((t) => t.trim().length > 0)],
      className: 'w-50',
    },
  ];

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

  // 新規追加
  const addJob = () => {
    setJobs([
      ...jobs,
      {
        title: '',
        cronExpression: '* * * * *',
        url: '',
      },
    ]);
  };
  const addReservation = () => {
    setReservations([
      ...reservations,
      {
        type: 'silent',
        start: dayjs().format('YYYY-MM-DDTHH:00'),
        end: dayjs().format('YYYY-MM-DDTHH:00'),
        target: '*',
      },
    ]);
  };

  // 操作結果のトースト表示
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
                            <ConfigTable
                              schema={jobsSchema}
                              items={jobs}
                              hasOrder
                              onAddItem={addJob}
                              onChange={(items) => setJobs(items)}
                              onClick={(row) => setCronEditorTarget(row)}
                            />
                          </CTabPane>
                          <CTabPane visible={activeTab === 1}>
                            <ConfigTable
                              schema={reservationsSchema}
                              items={reservations}
                              onAddItem={addReservation}
                              onChange={(items) => setReservations(items)}
                            />
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

          <CronEditor
            visible={cronEditorTarget !== null}
            cronExpression={jobs[cronEditorTarget]?.cronExpression}
            onClose={() => setCronEditorTarget(null)}
            onSubmit={(cronExpression) =>
              setJobs(jobs.map((job, i) => (cronEditorTarget !== i ? job : { ...job, cronExpression })))
            }
          />
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
