import { useCallback, useEffect, useState } from 'react';
import {
  FlexColumn, FlexRow,
  PrimaryButton, OutlinedPrimaryButton, DestructiveButton, SecondaryButton, Body,
  IconButton,
  Table, type TableColumn, type TableParams,
  TranslatedText,
  LoadingState,
  SuccessChip, DestructiveChip,
  TextInput,
  Autocomplete, type Option,
  Modal,
  EditIcon, BlockIcon, CheckCircleOutlineIcon, AddIcon,
  useI18n,
} from '@__SLUG__/components';
import { Page } from '../components/layout/Page';
import {
  fetchUsers, createUser, updateUser, resetUserPassword, disableUser, enableUser,
} from '../domains/auth/datasource';
import { DuplicateEmailError } from '../domains/auth/models';
import { setTraceId, ApiError } from '../lib/httpClient';
import type { User } from '../domains/auth/models';
import { useUser } from '../context/UserContext';
import { useServerTableParams } from '../hooks/useServerTableParams';

const ROLE_OPTIONS: Option[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'Member', value: 'member' },
];

function rolesToOptions(roles: string[]): Option[] {
  return roles.map((r) => ROLE_OPTIONS.find((o) => o.value === r) ?? { label: r, value: r });
}

function StatusCell({ isDisabled }: { isDisabled: boolean }) {
  return isDisabled
    ? <DestructiveChip label={<TranslatedText i18nKey="controlCenter.common.disabled" />} />
    : <SuccessChip label={<TranslatedText i18nKey="controlCenter.common.active" />} />;
}

interface AddUserForm {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  roles: string[];
}

interface EditUserForm {
  email: string;
  displayName: string;
  roles: string[];
  newPassword: string;
  confirmPassword: string;
}

const EMPTY_ADD_FORM: AddUserForm = { email: '', password: '', confirmPassword: '', displayName: '', roles: [] };
const EMPTY_EDIT_FORM: EditUserForm = { email: '', displayName: '', roles: [], newPassword: '', confirmPassword: '' };

function ManageUsers() {
  const { user: currentUserState } = useUser();
  const { dictionary } = useI18n();
  const currentUser = currentUserState.data ?? null;
  const [tableParams, setTableParams] = useServerTableParams();
  const [users, setUsers] = useState<LoadingState<User[]>>(LoadingState.unloaded());
  const [rowCount, setRowCount] = useState(0);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddUserForm>(EMPTY_ADD_FORM);
  const [addError, setAddError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditUserForm>(EMPTY_EDIT_FORM);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [disableTarget, setDisableTarget] = useState<User | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadUsers = useCallback(async (params: TableParams) => {
    setUsers(LoadingState.loading());
    try {
      const result = await fetchUsers(params);
      setUsers(LoadingState.loaded(result.data));
      setRowCount(result.total);
    } catch (err) {
      setUsers(LoadingState.error(err as Error));
    }
  }, []);

  useEffect(() => { loadUsers(tableParams); }, [tableParams]);

  const handleParamsChange = useCallback((params: TableParams) => {
    setTableParams(params);
  }, [setTableParams]);

  const openAdd = () => {
    setAddForm(EMPTY_ADD_FORM);
    setAddError(null);
    setAddOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addForm.password !== addForm.confirmPassword) {
      setAddError(dictionary.translate('controlCenter.common.passwordMismatch'));
      return;
    }
    setAddError(null);
    setSubmitting(true);
    setTraceId(crypto.randomUUID());
    try {
      await createUser(addForm.email, addForm.password, addForm.displayName, addForm.roles);
      setAddOpen(false);
      loadUsers(tableParams);
    } catch (err) {
      if (err instanceof DuplicateEmailError) {
        setAddError(err.message);
      } else if (err instanceof ApiError) {
        setAddError(`${dictionary.translate('controlCenter.auth.addUser.error')} (ID: ${err.traceId})`);
      } else {
        setAddError(dictionary.translate('controlCenter.auth.addUser.error'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({ email: user.email, displayName: user.displayName, roles: [...user.roles], newPassword: '', confirmPassword: '' });
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
      setEditError(dictionary.translate('controlCenter.common.passwordMismatch'));
      return;
    }
    setEditError(null);
    setEditSubmitting(true);
    setTraceId(crypto.randomUUID());
    try {
      await updateUser(editUser.id, { email: editForm.email, displayName: editForm.displayName, roles: editForm.roles });
      if (editForm.newPassword) {
        await resetUserPassword(editUser.id, editForm.newPassword);
      }
      setEditUser(null);
      loadUsers(tableParams);
    } catch (err) {
      if (err instanceof DuplicateEmailError) {
        setEditError(err.message);
      } else if (err instanceof ApiError) {
        setEditError(`${dictionary.translate('controlCenter.manageUsers.updateError')} (ID: ${err.traceId})`);
      } else {
        setEditError(dictionary.translate('controlCenter.manageUsers.updateError'));
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDisableConfirm = async () => {
    if (!disableTarget) return;
    setActionError(null);
    setTraceId(crypto.randomUUID());
    try {
      await disableUser(disableTarget.id);
      setDisableTarget(null);
      loadUsers(tableParams);
    } catch (err) {
      const suffix = err instanceof ApiError ? ` (ID: ${err.traceId})` : '';
      setActionError(`${(err as Error).message}${suffix}`);
      setDisableTarget(null);
    }
  };

  const handleEnable = async (user: User) => {
    setActionError(null);
    setTraceId(crypto.randomUUID());
    try {
      await enableUser(user.id);
      loadUsers(tableParams);
    } catch (err) {
      const suffix = err instanceof ApiError ? ` (ID: ${err.traceId})` : '';
      setActionError(`${(err as Error).message}${suffix}`);
    }
  };

  const isSelf = (user: User) => currentUser?.id === user.id;

  const COLUMNS: TableColumn[] = [
    { field: 'displayName', headerName: dictionary.translate('controlCenter.common.name'), flex: 1 },
    { field: 'email', headerName: dictionary.translate('controlCenter.common.email'), flex: 1.5 },
    {
      field: 'isDisabled',
      headerName: dictionary.translate('controlCenter.common.status'),
      width: 120,
      renderCell: (params) => <StatusCell isDisabled={params.value} />,
    },
    {
      field: 'actions',
      headerName: dictionary.translate('controlCenter.common.actions'),
      width: 100,
      sortable: false,
      renderCell: (params) => {
        const user: User = params.row;
        return (
          <FlexRow gap={0} style={{ alignItems: 'center', height: '100%' }}>
            <IconButton tooltip={dictionary.translate('controlCenter.manageUsers.editUser')} size="small" onClick={() => openEdit(user)}>
              <EditIcon fontSize="small" />
            </IconButton>
            {user.isDisabled
              ? (
                <IconButton tooltip={dictionary.translate('controlCenter.manageUsers.enable')} size="small" color="success" onClick={() => handleEnable(user)}>
                  <CheckCircleOutlineIcon fontSize="small" />
                </IconButton>
              ) : (
                <IconButton
                  tooltip={isSelf(user)
                    ? dictionary.translate('controlCenter.manageUsers.selfDisableError')
                    : dictionary.translate('controlCenter.manageUsers.disable')}
                  size="small"
                  color="error"
                  disabled={isSelf(user)}
                  onClick={() => !isSelf(user) && setDisableTarget(user)}
                >
                  <BlockIcon fontSize="small" />
                </IconButton>
              )}
          </FlexRow>
        );
      },
    },
  ];

  return (
    <Page title={<TranslatedText i18nKey="controlCenter.manageUsers.title" />}>
      <FlexColumn gap={16}>
        {actionError && <Body style={{ color: 'red' }}>{actionError}</Body>}

        <FlexRow style={{ justifyContent: 'flex-end' }}>
          <SecondaryButton data-id="open-add-user" onClick={openAdd} startIcon={<AddIcon />}>
            <TranslatedText i18nKey="controlCenter.auth.addUser.title" />
          </SecondaryButton>
        </FlexRow>

        <Table
          rows={users.data ?? []}
          columns={COLUMNS}
          loading={users.isLoading()}
          getRowId={(row) => row.id}
          height={500}
          rowCount={rowCount}
          onParamsChange={handleParamsChange}
          errorMessage={users.isError() ? dictionary.translate('controlCenter.manageUsers.loadError') : undefined}
        />

        {/* Add User Modal */}
        <Modal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          disableClose
          title={<TranslatedText i18nKey="controlCenter.auth.addUser.title" />}
          actions={
            <FlexRow gap={2}>
              <OutlinedPrimaryButton onClick={() => setAddOpen(false)}>
                <TranslatedText i18nKey="controlCenter.common.cancel" />
              </OutlinedPrimaryButton>
              <PrimaryButton data-id="add-user-submit" type="submit" form="add-user-form" disabled={submitting}>
                {submitting
                  ? <TranslatedText i18nKey="controlCenter.common.creating" />
                  : <TranslatedText i18nKey="controlCenter.auth.addUser.title" />}
              </PrimaryButton>
            </FlexRow>
          }
        >
          {addError && <Body style={{ color: 'red' }}>{addError}</Body>}
          <form id="add-user-form" onSubmit={handleAddSubmit}>
            <FlexColumn gap={16}>
              <TextInput
                data-id="add-user-display-name"
                label={dictionary.translate('controlCenter.common.displayName')}
                value={addForm.displayName}
                onChange={(v) => setAddForm((f) => ({ ...f, displayName: v }))}
              />
              <TextInput
                data-id="add-user-email"
                label={dictionary.translate('controlCenter.common.email')}
                type="email"
                value={addForm.email}
                onChange={(v) => setAddForm((f) => ({ ...f, email: v }))}
              />
              <TextInput
                data-id="add-user-password"
                label={dictionary.translate('controlCenter.common.password')}
                type="password"
                value={addForm.password}
                onChange={(v) => setAddForm((f) => ({ ...f, password: v }))}
              />
              <TextInput
                data-id="add-user-confirm-password"
                label={dictionary.translate('controlCenter.common.confirmPassword')}
                type="password"
                value={addForm.confirmPassword}
                onChange={(v) => setAddForm((f) => ({ ...f, confirmPassword: v }))}
              />
              <Autocomplete
                label={dictionary.translate('controlCenter.common.roles')}
                multiple
                options={ROLE_OPTIONS}
                value={rolesToOptions(addForm.roles)}
                onChange={(v) => setAddForm((f) => ({ ...f, roles: (v as Option[] | null)?.map((o) => o.value) ?? [] }))}
                size="small"
              />
            </FlexColumn>
          </form>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          open={!!editUser}
          onClose={() => setEditUser(null)}
          disableClose
          title={<TranslatedText i18nKey="controlCenter.manageUsers.editUser" />}
          actions={
            <FlexRow gap={2}>
              <OutlinedPrimaryButton onClick={() => setEditUser(null)}>
                <TranslatedText i18nKey="controlCenter.common.cancel" />
              </OutlinedPrimaryButton>
              <PrimaryButton type="submit" form="edit-user-form" disabled={editSubmitting}>
                {editSubmitting
                  ? <TranslatedText i18nKey="controlCenter.common.saving" />
                  : <TranslatedText i18nKey="controlCenter.common.save" />}
              </PrimaryButton>
            </FlexRow>
          }
        >
          {editError && <Body style={{ color: 'red' }}>{editError}</Body>}
          <form id="edit-user-form" onSubmit={handleEditSubmit}>
            <FlexColumn gap={16}>
              <TextInput
                label={dictionary.translate('controlCenter.common.displayName')}
                value={editForm.displayName}
                onChange={(v) => setEditForm((f) => ({ ...f, displayName: v }))}
              />
              <TextInput
                label={dictionary.translate('controlCenter.common.email')}
                type="email"
                value={editForm.email}
                onChange={(v) => setEditForm((f) => ({ ...f, email: v }))}
              />
              <Autocomplete
                label={dictionary.translate('controlCenter.common.roles')}
                multiple
                options={ROLE_OPTIONS}
                value={rolesToOptions(editForm.roles)}
                onChange={(v) => setEditForm((f) => ({ ...f, roles: (v as Option[] | null)?.map((o) => o.value) ?? [] }))}
                size="small"
              />
              <TextInput
                label={dictionary.translate('controlCenter.common.newPassword')}
                type="password"
                value={editForm.newPassword}
                onChange={(v) => setEditForm((f) => ({ ...f, newPassword: v }))}
                helperText={dictionary.translate('controlCenter.manageUsers.newPasswordHelperText')}
              />
              <TextInput
                label={dictionary.translate('controlCenter.common.confirmPassword')}
                type="password"
                value={editForm.confirmPassword}
                onChange={(v) => setEditForm((f) => ({ ...f, confirmPassword: v }))}
              />
            </FlexColumn>
          </form>
        </Modal>

        {/* Disable Confirmation Modal */}
        <Modal
          open={!!disableTarget}
          onClose={() => setDisableTarget(null)}
          title={<TranslatedText i18nKey="controlCenter.manageUsers.disableUser" />}
          maxWidth="xs"
          actions={
            <FlexRow gap={2}>
              <OutlinedPrimaryButton onClick={() => setDisableTarget(null)}>
                <TranslatedText i18nKey="controlCenter.common.cancel" />
              </OutlinedPrimaryButton>
              <DestructiveButton onClick={handleDisableConfirm}>
                <TranslatedText i18nKey="controlCenter.manageUsers.disable" />
              </DestructiveButton>
            </FlexRow>
          }
        >
          <Body>
            <TranslatedText i18nKey="controlCenter.manageUsers.disableConfirm" />
            {' '}{disableTarget?.displayName}?
          </Body>
        </Modal>
      </FlexColumn>
    </Page>
  );
}

export default ManageUsers;
