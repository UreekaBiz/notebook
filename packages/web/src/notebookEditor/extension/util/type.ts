// ********************************************************************************
// Utility function that modifies the return type of the given function with the
// given return type.
export type ModifyReturnType<Func extends (...args: any) => any, ReturnType> = (...args: Parameters<Func>) => ReturnType;

// Alias for ModifyReturnType used explicitly when defining a command.
// Should be used when exposing the type of a command.
// This is needed since the return type of the command is different than the value
// returned by the original function when accessing it directly with editor.commands.
export type CommandFunctionType<Func extends (...args: any) => any, ReturnType> = ModifyReturnType<Func, ReturnType>;
