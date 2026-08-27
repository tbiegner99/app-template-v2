package pagination

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func makeRequest(body string) *http.Request {
	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	return req
}

func TestDecode_Defaults(t *testing.T) {
	p, err := Decode(makeRequest(`{}`))
	require.NoError(t, err)
	assert.Equal(t, 0, p.Page)
	assert.Equal(t, 25, p.PageSize)
	assert.Equal(t, SortAsc, p.SortDir)
}

func TestDecode_PageSizeClampLow(t *testing.T) {
	p, err := Decode(makeRequest(`{"pageSize":0}`))
	require.NoError(t, err)
	assert.Equal(t, 25, p.PageSize)
}

func TestDecode_PageSizeClampNegative(t *testing.T) {
	p, err := Decode(makeRequest(`{"pageSize":-5}`))
	require.NoError(t, err)
	assert.Equal(t, 25, p.PageSize)
}

func TestDecode_PageSizeClampHigh(t *testing.T) {
	p, err := Decode(makeRequest(`{"pageSize":999}`))
	require.NoError(t, err)
	assert.Equal(t, 25, p.PageSize)
}

func TestDecode_PageSizeValid(t *testing.T) {
	p, err := Decode(makeRequest(`{"pageSize":50}`))
	require.NoError(t, err)
	assert.Equal(t, 50, p.PageSize)
}

func TestDecode_PageClampNegative(t *testing.T) {
	p, err := Decode(makeRequest(`{"page":-1}`))
	require.NoError(t, err)
	assert.Equal(t, 0, p.Page)
}

func TestDecode_PageValid(t *testing.T) {
	p, err := Decode(makeRequest(`{"page":3}`))
	require.NoError(t, err)
	assert.Equal(t, 3, p.Page)
}

func TestDecode_SortDirDefault(t *testing.T) {
	p, err := Decode(makeRequest(`{"sortDir":"invalid"}`))
	require.NoError(t, err)
	assert.Equal(t, SortAsc, p.SortDir)
}

func TestDecode_SortDirDesc(t *testing.T) {
	p, err := Decode(makeRequest(`{"sortDir":"desc"}`))
	require.NoError(t, err)
	assert.Equal(t, SortDesc, p.SortDir)
}

func TestDecode_InvalidJSON(t *testing.T) {
	_, err := Decode(makeRequest(`not json`))
	assert.Error(t, err)
}

func TestResolve_ValidSort(t *testing.T) {
	colMap := map[string]string{"name": "display_name"}
	p := Params{Page: 0, PageSize: 10, Sort: "name", SortDir: SortAsc}
	rp, err := Resolve(p, colMap)
	require.NoError(t, err)
	assert.Equal(t, "display_name", rp.Sort)
}

func TestResolve_InvalidSort(t *testing.T) {
	colMap := map[string]string{"name": "display_name"}
	p := Params{Sort: "unknown"}
	_, err := Resolve(p, colMap)
	require.Error(t, err)
	var ife *InvalidFieldError
	assert.ErrorAs(t, err, &ife)
	assert.Equal(t, "unknown", ife.Field)
}

func TestResolve_ValidFilter(t *testing.T) {
	colMap := map[string]string{"email": "email"}
	p := Params{
		Filters: []FilterParam{{Field: "email", Op: OpEq, Value: "a@b.com"}},
	}
	rp, err := Resolve(p, colMap)
	require.NoError(t, err)
	require.Len(t, rp.Filters, 1)
	assert.Equal(t, "email", rp.Filters[0].Column)
	assert.Equal(t, OpEq, rp.Filters[0].Op)
}

func TestResolve_InvalidFilter(t *testing.T) {
	colMap := map[string]string{"email": "email"}
	p := Params{
		Filters: []FilterParam{{Field: "badfield", Op: OpEq, Value: "v"}},
	}
	_, err := Resolve(p, colMap)
	require.Error(t, err)
}

func TestResolve_MultipleFilters(t *testing.T) {
	colMap := map[string]string{"email": "email", "name": "display_name"}
	p := Params{
		Filters: []FilterParam{
			{Field: "email", Op: OpContains, Value: "foo"},
			{Field: "name", Op: OpEq, Value: "bar"},
		},
	}
	rp, err := Resolve(p, colMap)
	require.NoError(t, err)
	assert.Len(t, rp.Filters, 2)
}

func TestResolve_EmptySort(t *testing.T) {
	colMap := map[string]string{"name": "display_name"}
	p := Params{}
	rp, err := Resolve(p, colMap)
	require.NoError(t, err)
	assert.Empty(t, rp.Sort)
}

func TestOffset(t *testing.T) {
	rp := ResolvedParams{Page: 2, PageSize: 10}
	assert.Equal(t, 20, rp.Offset())
}

func TestOffset_Zero(t *testing.T) {
	rp := ResolvedParams{Page: 0, PageSize: 25}
	assert.Equal(t, 0, rp.Offset())
}

func TestInvalidFieldError_Message(t *testing.T) {
	e := &InvalidFieldError{Field: "foo"}
	assert.Equal(t, "unknown field: foo", e.Error())
}
