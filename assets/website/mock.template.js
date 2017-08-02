{{each apps}}{{if $value.existsMock}}
import './{{$value.relaMockPath}}';{{/if}}{{/each}}