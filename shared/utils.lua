PhoneUtils = {}

function PhoneUtils.FormatPhoneNumber(number)
    if not number then return '000-0000' end
    local clean = tostring(number):gsub('%D', '')
    if #clean < 7 then
        clean = clean .. string.rep('0', 7 - #clean)
    end
    return clean:sub(1, 3) .. '-' .. clean:sub(4, 7)
end

function PhoneUtils.IsEmpty(value)
    return value == nil or value == ''
end

function PhoneUtils.DeepCopy(tbl)
    local copy = {}
    for key, value in pairs(tbl or {}) do
        if type(value) == 'table' then
            copy[key] = PhoneUtils.DeepCopy(value)
        else
            copy[key] = value
        end
    end
    return copy
end
