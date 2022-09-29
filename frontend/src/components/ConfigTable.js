import {
  CButton,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableFoot,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';
import * as fasIcon from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function ConfigTable({ schema, items, hasOrder, onAddItem, onChange, onClick }) {
  return (
    <CTable responsive striped hover>
      <CTableHead>
        <CTableRow>
          {schema.map((header, i) => (
            <CTableHeaderCell scope='col' className={`p-2 ${header.className}`} key={i}>
              {header.caption}
            </CTableHeaderCell>
          ))}
          <CTableHeaderCell scope='col' className='p-2'>
            {/* 操作ボタン列 */}
          </CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {items.map((cells, row) => (
          <CTableRow key={row}>
            {schema.map((header, column) => (
              <CTableDataCell key={column}>
                <CInputGroup>
                  {(header?.type ?? 'text') !== 'select' ? (
                    <CFormInput
                      type={header?.type ?? 'text'}
                      value={cells[header.key]}
                      onChange={(e) =>
                        onChange(
                          items.map((item, i) => (row !== i ? item : { ...item, [header.key]: e.target.value })),
                          row,
                          column,
                          'edit',
                        )
                      }
                    />
                  ) : null}
                  {(header?.type ?? 'text') === 'select' ? (
                    <CFormSelect
                      options={header.options()}
                      value={cells[header.key]}
                      onChange={(e) =>
                        onChange(
                          items.map((item, i) => (row !== i ? item : { ...item, [header.key]: e.target.value })),
                          row,
                          column,
                          'edit',
                        )
                      }
                    />
                  ) : null}
                  {header?.hasButton ? (
                    <CButton type='button' color='secondary' variant='outline' onClick={() => onClick(row, column)}>
                      ...
                    </CButton>
                  ) : null}
                </CInputGroup>
              </CTableDataCell>
            ))}

            {/* 操作ボタン列 */}
            <CTableDataCell className='text-nowrap'>
              <CButton
                variant='outline'
                color='danger'
                shape='rounded-pill'
                onClick={() =>
                  onChange(
                    items.filter((_, i) => row !== i),
                    row,
                    null,
                    'delete',
                  )
                }
              >
                <FontAwesomeIcon icon={fasIcon.faTrashAlt} />
              </CButton>
              {hasOrder ? (
                <CButton
                  className='ms-2'
                  variant='outline'
                  color='dark'
                  shape='rounded-pill'
                  onClick={() => {
                    items.splice(row - 1, 2, items[row], items[row - 1]);
                    onChange([...items], row, null, 'up');
                  }}
                  disabled={row === 0}
                >
                  <FontAwesomeIcon icon={fasIcon.faArrowUp} />
                </CButton>
              ) : null}
              {hasOrder ? (
                <CButton
                  variant='outline'
                  color='dark'
                  shape='rounded-pill'
                  onClick={() => {
                    items.splice(row, 2, items[row + 1], items[row]);
                    onChange([...items], row, null, 'down');
                  }}
                  disabled={row === items.length - 1}
                >
                  <FontAwesomeIcon icon={fasIcon.faArrowDown} />
                </CButton>
              ) : null}
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
      <CTableFoot>
        <CTableRow>
          <CTableDataCell className='py-3 border-0'>
            <CButton className='px-3' variant='outline' color='primary' shape='rounded-pill' onClick={onAddItem}>
              <FontAwesomeIcon icon={fasIcon.faPlus} />
            </CButton>
          </CTableDataCell>
        </CTableRow>
      </CTableFoot>
    </CTable>
  );
}
