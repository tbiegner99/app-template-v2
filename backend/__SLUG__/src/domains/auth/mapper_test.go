package auth

import (
	"testing"

	"go_backend/src/shared/pagination"
)

func newMapper() *Mapper {
	return NewMapper()
}

func TestUserToDTO(t *testing.T) {
	m := newMapper()
	user := &User{
		ID:    "u1",
		Email: "a@b.com",
		Name:  "Alice",
		Roles: []UserRole{{Name: "admin", ContextId: "site-1"}},
	}
	dto := m.UserToDTO(user)
	if dto.ID != "u1" {
		t.Errorf("expected ID u1, got %s", dto.ID)
	}
	if dto.Email != "a@b.com" {
		t.Errorf("expected email a@b.com, got %s", dto.Email)
	}
	if len(dto.Roles) != 1 || dto.Roles[0].Name != "admin" {
		t.Errorf("expected roles [admin], got %v", dto.Roles)
	}
}

func TestSessionToDTO(t *testing.T) {
	m := newMapper()
	session := &Session{
		UserID:        "u1",
		SessionHandle: "sh1",
		AccessToken:   "at1",
		RefreshToken:  "rt1",
	}
	dto := m.SessionToDTO(session)
	if dto.UserID != "u1" || dto.AccessToken != "at1" {
		t.Errorf("unexpected session dto: %+v", dto)
	}
}

func TestSignUpRequestToModel(t *testing.T) {
	m := newMapper()
	dto := &SignUpRequestDTO{Email: "x@y.com", Password: "pass123"}
	model := m.SignUpRequestToModel(dto)
	if model.Email != "x@y.com" {
		t.Errorf("expected email x@y.com, got %s", model.Email)
	}
}

func TestSignInRequestToModel(t *testing.T) {
	m := newMapper()
	dto := &SignInRequestDTO{Email: "x@y.com", Password: "pass"}
	model := m.SignInRequestToModel(dto)
	if model.Password != "pass" {
		t.Errorf("expected password pass, got %s", model.Password)
	}
}

func TestApplicationUserToDTO_NilRoles(t *testing.T) {
	m := newMapper()
	u := &ApplicationUser{ID: "u1", Email: "a@b.com", DisplayName: "Alice", IsDisabled: false, Roles: nil}
	dto := m.ApplicationUserToDTO(u)
	if len(dto.Roles) != 0 {
		t.Errorf("expected empty roles, got %v", dto.Roles)
	}
}

func TestApplicationUserToDTO_WithRoles(t *testing.T) {
	m := newMapper()
	u := &ApplicationUser{ID: "u2", Email: "b@c.com", DisplayName: "Bob", Roles: []string{"editor"}}
	dto := m.ApplicationUserToDTO(u)
	if len(dto.Roles) != 1 || dto.Roles[0] != "editor" {
		t.Errorf("expected [editor], got %v", dto.Roles)
	}
}

func TestApplicationUserListToDTO(t *testing.T) {
	m := newMapper()
	users := []ApplicationUser{
		{ID: "u1", Roles: []string{"admin"}},
		{ID: "u2", Roles: nil},
	}
	dtos := m.ApplicationUserListToDTO(users)
	if len(dtos) != 2 {
		t.Errorf("expected 2 dtos, got %d", len(dtos))
	}
}

func TestApplicationUserPageToDTO(t *testing.T) {
	m := newMapper()
	page := pagination.PagedResponse[ApplicationUser]{
		Data:     []ApplicationUser{{ID: "u1"}},
		Total:    1,
		Page:     0,
		PageSize: 10,
	}
	result := m.ApplicationUserPageToDTO(page)
	if result.Total != 1 || len(result.Data) != 1 {
		t.Errorf("unexpected paged result: %+v", result)
	}
}

func TestChangePasswordRequestToModel(t *testing.T) {
	m := newMapper()
	dto := &ChangePasswordRequestDTO{OldPassword: "old", NewPassword: "new"}
	model := m.ChangePasswordRequestToModel(dto)
	if model.OldPassword != "old" || model.NewPassword != "new" {
		t.Errorf("unexpected model: %+v", model)
	}
}
