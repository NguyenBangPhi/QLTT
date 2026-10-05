import { z } from 'zod'

/**
 * Thông báo lỗi mặc định của zod là tiếng Anh ("Expected string, received number").
 * Đặt error map tiếng Việt một lần ở đây để mọi schema đều có câu chữ dễ hiểu, kể cả
 * những nhánh lỗi mà lúc viết schema không lường trước nên không gắn message riêng.
 */
const viErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === 'undefined' || issue.received === 'null') {
        return { message: 'Vui lòng nhập thông tin này' }
      }
      if (issue.expected === 'number') return { message: 'Giá trị phải là số' }
      if (issue.expected === 'string') return { message: 'Giá trị phải là chuỗi ký tự' }
      return { message: 'Giá trị không hợp lệ' }

    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        return issue.minimum === 1
          ? { message: 'Vui lòng nhập thông tin này' }
          : { message: `Phải có ít nhất ${issue.minimum} ký tự` }
      }
      if (issue.type === 'number') {
        return { message: `Giá trị phải lớn hơn hoặc bằng ${issue.minimum}` }
      }
      return { message: 'Giá trị quá nhỏ' }

    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') return { message: `Không được vượt quá ${issue.maximum} ký tự` }
      if (issue.type === 'number') {
        return { message: `Giá trị phải nhỏ hơn hoặc bằng ${issue.maximum}` }
      }
      return { message: 'Giá trị quá lớn' }

    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'email') return { message: 'Email không hợp lệ' }
      return { message: 'Định dạng không hợp lệ' }

    case z.ZodIssueCode.not_multiple_of:
      return { message: `Giá trị phải là bội số của ${issue.multipleOf}` }

    default:
      return { message: ctx.defaultError === 'Required' ? 'Vui lòng nhập thông tin này' : 'Giá trị không hợp lệ' }
  }
}

export default defineNuxtPlugin(() => {
  z.setErrorMap(viErrorMap)
})
