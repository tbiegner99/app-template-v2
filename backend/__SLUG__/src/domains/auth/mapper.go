package auth

import "go_backend/src/shared/pagination"

type RoleDTO struct {
	Name      string `json:"name"`
	ContextId string `json:"contextId,omitempty"`
}

// UserDTO represents the data transfer object for user API responses
type UserDTO struct {
	ID       string                 `json:"id"`
	Email    string                 `json:"email"`
	Name     string                 `json:"name"`
	Roles    []RoleDTO              `json:"roles,omitempty"`
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// SessionDTO represents the data transfer object for session responses
type SessionDTO struct {
	UserID        string `json:"userId"`
	SessionHandle string `json:"sessionHandle"`
	AccessToken   string `json:"accessToken"`
	RefreshToken  string `json:"refreshToken"`
}

// ApplicationUserDTO is the API response shape for an application user.
type ApplicationUserDTO struct {
	ID          string   `json:"id"`
	Email       string   `json:"email"`
	DisplayName string   `json:"displayName"`
	IsDisabled  bool     `json:"isDisabled"`
	Roles       []string `json:"roles"`
}

// UpdateUserRequestDTO is the request body for updating a user.
type UpdateUserRequestDTO struct {
	Email       string   `json:"email"`
	DisplayName string   `json:"displayName"`
	Roles       []string `json:"roles"`
}

// AdminResetPasswordRequestDTO is the request body for admin password reset.
type AdminResetPasswordRequestDTO struct {
	NewPassword string `json:"newPassword"`
}

// ChangePasswordRequestDTO is the request body for password changes.
type ChangePasswordRequestDTO struct {
	OldPassword string `json:"oldPassword"`
	NewPassword string `json:"newPassword"`
}

// SignUpRequestDTO represents the DTO for sign up requests
type SignUpRequestDTO struct {
	Email       string   `json:"email"`
	Password    string   `json:"password"`
	DisplayName string   `json:"displayName"`
	Roles       []string `json:"roles"`
}

// SignInRequestDTO represents the DTO for sign in requests
type SignInRequestDTO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Mapper handles conversions between domain models and DTOs
type Mapper struct{}

// NewMapper creates a new mapper instance
func NewMapper() *Mapper {
	return &Mapper{}
}

// UserToDTO converts a User model to UserDTO
func (m *Mapper) UserToDTO(user *User) *UserDTO {
	roles := make([]RoleDTO, len(user.Roles))
	for i, role := range user.Roles {
		roles[i] = RoleDTO{
			Name:      role.Name,
			ContextId: role.ContextId,
		}
	}
	return &UserDTO{
		ID:       user.ID,
		Email:    user.Email,
		Name:     user.Name,
		Roles:    roles,
		Metadata: user.Metadata,
	}
}

// SessionToDTO converts a Session model to SessionDTO
func (m *Mapper) SessionToDTO(session *Session) *SessionDTO {
	return &SessionDTO{
		UserID:        session.UserID,
		SessionHandle: session.SessionHandle,
		AccessToken:   session.AccessToken,
		RefreshToken:  session.RefreshToken,
	}
}

// SignUpRequestToModel converts SignUpRequestDTO to SignUpRequest model
func (m *Mapper) SignUpRequestToModel(dto *SignUpRequestDTO) *SignUpRequest {
	return &SignUpRequest{
		Email:    dto.Email,
		Password: dto.Password,
	}
}

// SignInRequestToModel converts SignInRequestDTO to SignInRequest model
func (m *Mapper) SignInRequestToModel(dto *SignInRequestDTO) *SignInRequest {
	return &SignInRequest{
		Email:    dto.Email,
		Password: dto.Password,
	}
}

// ApplicationUserToDTO converts an ApplicationUser to its DTO
func (m *Mapper) ApplicationUserToDTO(u *ApplicationUser) *ApplicationUserDTO {
	roles := u.Roles
	if roles == nil {
		roles = []string{}
	}
	return &ApplicationUserDTO{
		ID:          u.ID,
		Email:       u.Email,
		DisplayName: u.DisplayName,
		IsDisabled:  u.IsDisabled,
		Roles:       roles,
	}
}

// ApplicationUserListToDTO converts a slice of ApplicationUser to DTOs.
func (m *Mapper) ApplicationUserListToDTO(users []ApplicationUser) []*ApplicationUserDTO {
	dtos := make([]*ApplicationUserDTO, len(users))
	for i := range users {
		dtos[i] = m.ApplicationUserToDTO(&users[i])
	}
	return dtos
}

// ApplicationUserPageToDTO converts a PagedResponse[ApplicationUser] to a paged DTO response.
func (m *Mapper) ApplicationUserPageToDTO(p pagination.PagedResponse[ApplicationUser]) pagination.PagedResponse[*ApplicationUserDTO] {
	dtos := make([]*ApplicationUserDTO, len(p.Data))
	for i := range p.Data {
		dtos[i] = m.ApplicationUserToDTO(&p.Data[i])
	}
	return pagination.PagedResponse[*ApplicationUserDTO]{
		Data:     dtos,
		Total:    p.Total,
		Page:     p.Page,
		PageSize: p.PageSize,
	}
}

// ChangePasswordRequestToModel converts the DTO to the domain model
func (m *Mapper) ChangePasswordRequestToModel(dto *ChangePasswordRequestDTO) *ChangePasswordRequest {
	return &ChangePasswordRequest{
		OldPassword: dto.OldPassword,
		NewPassword: dto.NewPassword,
	}
}
