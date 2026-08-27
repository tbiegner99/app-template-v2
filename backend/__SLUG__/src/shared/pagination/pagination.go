package pagination

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type SortDir string

const (
	SortAsc  SortDir = "asc"
	SortDesc SortDir = "desc"
)

type FilterOp string

const (
	OpEq       FilterOp = "eq"
	OpContains FilterOp = "contains"
	OpGt       FilterOp = "gt"
	OpGte      FilterOp = "gte"
	OpLt       FilterOp = "lt"
	OpLte      FilterOp = "lte"
)

type FilterParam struct {
	Field string   `json:"field"`
	Op    FilterOp `json:"op"`
	Value string   `json:"value"`
}

type Params struct {
	Page     int           `json:"page"`
	PageSize int           `json:"pageSize"`
	Sort     string        `json:"sort"`
	SortDir  SortDir       `json:"sortDir"`
	Filters  []FilterParam `json:"filters"`
}

type PagedResponse[T any] struct {
	Data     []T `json:"data"`
	Total    int `json:"total"`
	Page     int `json:"page"`
	PageSize int `json:"pageSize"`
}

// ResolvedFilter holds a filter with its DB column already mapped.
type ResolvedFilter struct {
	Column string
	Op     FilterOp
	Value  string
}

// ResolvedParams holds pagination params with sort field mapped to a DB column.
type ResolvedParams struct {
	Page     int
	PageSize int
	Sort     string // DB column
	SortDir  SortDir
	Filters  []ResolvedFilter
}

// Decode parses and validates a Params from the request body.
func Decode(r *http.Request) (Params, error) {
	var p Params
	p.Page = 0
	p.PageSize = 25
	p.SortDir = SortAsc

	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		return p, fmt.Errorf("invalid request body: %w", err)
	}
	if p.PageSize <= 0 || p.PageSize > 200 {
		p.PageSize = 25
	}
	if p.Page < 0 {
		p.Page = 0
	}
	if p.SortDir != SortAsc && p.SortDir != SortDesc {
		p.SortDir = SortAsc
	}
	return p, nil
}

// InvalidFieldError is returned when a sort or filter field is not in the column map.
type InvalidFieldError struct{ Field string }

func (e *InvalidFieldError) Error() string { return "unknown field: " + e.Field }

// Resolve maps field names to DB columns using the provided columnMap.
// Returns an InvalidFieldError if any field is unknown.
func Resolve(p Params, columnMap map[string]string) (ResolvedParams, error) {
	resolved := ResolvedParams{
		Page:     p.Page,
		PageSize: p.PageSize,
		SortDir:  p.SortDir,
	}

	if p.Sort != "" {
		col, ok := columnMap[p.Sort]
		if !ok {
			return resolved, &InvalidFieldError{Field: p.Sort}
		}
		resolved.Sort = col
	}

	for _, f := range p.Filters {
		col, ok := columnMap[f.Field]
		if !ok {
			return resolved, &InvalidFieldError{Field: f.Field}
		}
		resolved.Filters = append(resolved.Filters, ResolvedFilter{
			Column: col,
			Op:     f.Op,
			Value:  f.Value,
		})
	}

	return resolved, nil
}

// Offset returns the SQL OFFSET for the current page.
func (p ResolvedParams) Offset() int {
	return p.Page * p.PageSize
}
